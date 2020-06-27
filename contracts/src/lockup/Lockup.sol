pragma solidity ^0.5.0;

// prettier-ignore
import {ERC20Mintable} from "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {Decimals} from "contracts/src/common/libs/Decimals.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {Property} from "contracts/src/property/Property.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {LockupStorage} from "contracts/src/lockup/LockupStorage.sol";
import {Policy} from "contracts/src/policy/Policy.sol";
import {IAllocator} from "contracts/src/allocator/IAllocator.sol";
import {IVoteTimes} from "contracts/src/vote/times/IVoteTimes.sol";
import {ILockup} from "contracts/src/lockup/ILockup.sol";

contract Lockup is ILockup, Pausable, UsingConfig, UsingValidator {
	using SafeMath for uint256;
	using Decimals for uint256;
	uint256 public deployedBlock;
	event Lockedup(address _from, address _property, uint256 _value);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {
		// Save a deployed block number locally for a fallback of getCumulativeLockedUpUnitAndBlock.
		deployedBlock = block.number;
	}

	function lockup(
		address _from,
		address _property,
		uint256 _value
	) external {
		addressValidator().validateAddress(msg.sender, config().token());
		addressValidator().validateGroup(_property, config().propertyGroup());
		require(_value != 0, "illegal lockup value");
		LockupStorage lockupStorage = getStorage();

		bool isWaiting = lockupStorage.getWithdrawalStatus(_property, _from) !=
			0;
		require(isWaiting == false, "lockup is already canceled");
		if (lockupStorage.getLastBlockNumber(_property) == 0) {
			// Set the block that has been locked-up for the first time as the starting block.
			lockupStorage.setLastBlockNumber(_property, block.number);
		}
		updatePendingInterestWithdrawal(lockupStorage, _property, _from);
		(, uint256 last) = _calculateWithdrawableInterestAmount(
			lockupStorage,
			_property,
			_from
		);
		updateLastPriceForProperty(lockupStorage, _property, _from, last);
		updateValues(lockupStorage, true, _from, _property, _value);
		emit Lockedup(_from, _property, _value);
	}

	function cancel(address _property) external {
		addressValidator().validateGroup(_property, config().propertyGroup());

		require(hasValue(_property, msg.sender), "dev token is not locked");
		LockupStorage lockupStorage = getStorage();
		bool isWaiting = lockupStorage.getWithdrawalStatus(
			_property,
			msg.sender
		) != 0;
		require(isWaiting == false, "lockup is already canceled");
		uint256 blockNumber = Policy(config().policy()).lockUpBlocks();
		blockNumber = blockNumber.add(block.number);
		lockupStorage.setWithdrawalStatus(_property, msg.sender, blockNumber);
	}

	function withdraw(address _property) external {
		addressValidator().validateGroup(_property, config().propertyGroup());

		require(possible(_property, msg.sender), "waiting for release");
		LockupStorage lockupStorage = getStorage();
		uint256 lockedUpValue = lockupStorage.getValue(_property, msg.sender);
		require(lockedUpValue != 0, "dev token is not locked");
		updatePendingInterestWithdrawal(lockupStorage, _property, msg.sender);
		Property(_property).withdraw(msg.sender, lockedUpValue);
		updateValues(
			lockupStorage,
			false,
			msg.sender,
			_property,
			lockedUpValue
		);
		lockupStorage.setValue(_property, msg.sender, 0);
		lockupStorage.setWithdrawalStatus(_property, msg.sender, 0);
	}

	function getCumulativeLockedUpUnitAndBlock(
		LockupStorage lockupStorage,
		address _property
	) private view returns (uint256 _unit, uint256 _block) {
		(uint256 unit, uint256 lastBlock) = lockupStorage
			.getCumulativeLockedUpUnitAndBlock(_property);
		if (lastBlock > 0) {
			return (unit, lastBlock);
		}
		// When lastBlock is 0, CumulativeLockedUpUnitAndBlock is not saved yet so failback to AllValue or PropertyValue.
		unit = _property == address(0)
			? lockupStorage.getAllValue()
			: lockupStorage.getPropertyValue(_property);
		// Assign lastBlock as deployedBlock because when AllValue or PropertyValue is not 0, already locked-up when deployed this contract.
		lastBlock = deployedBlock;
		return (unit, lastBlock);
	}

	function getCumulativeLockedUp(address _property)
		public
		view
		returns (
			uint256 _value,
			uint256 _unit,
			uint256 _block
		)
	{
		LockupStorage lockupStorage = getStorage();
		(uint256 unit, uint256 lastBlock) = getCumulativeLockedUpUnitAndBlock(
			lockupStorage,
			_property
		);
		uint256 lastValue = lockupStorage.getCumulativeLockedUpValue(_property);
		return (
			lastValue.add(unit.mul(block.number.sub(lastBlock))),
			unit,
			lastBlock
		);
	}

	function getCumulativeLockedUpAll()
		public
		view
		returns (
			uint256 _value,
			uint256 _unit,
			uint256 _block
		)
	{
		return getCumulativeLockedUp(address(0));
	}

	function updateCumulativeLockedUp(
		LockupStorage lockupStorage,
		bool _addition,
		address _property,
		uint256 _unit
	) private {
		address zero = address(0);
		(uint256 lastValue, uint256 lastUnit, ) = getCumulativeLockedUp(
			_property
		);
		(uint256 lastValueAll, uint256 lastUnitAll, ) = getCumulativeLockedUp(
			zero
		);
		lockupStorage.setCumulativeLockedUpValue(
			_property,
			_addition ? lastValue.add(_unit) : lastValue.sub(_unit)
		);
		lockupStorage.setCumulativeLockedUpValue(
			zero,
			_addition ? lastValueAll.add(_unit) : lastValueAll.sub(_unit)
		);
		lockupStorage.setCumulativeLockedUpUnitAndBlock(
			_property,
			_addition ? lastUnit.add(_unit) : lastUnit.sub(_unit),
			block.number
		);
		lockupStorage.setCumulativeLockedUpUnitAndBlock(
			zero,
			_addition ? lastUnitAll.add(_unit) : lastUnitAll.sub(_unit),
			block.number
		);
	}

	function update() public {
		LockupStorage lockupStorage = getStorage();
		(uint256 _nextRewards, uint256 _amount) = dry(lockupStorage);
		lockupStorage.setCumulativeGlobalRewards(_nextRewards);
		lockupStorage.setLastSameRewardsAmountAndBlock(_amount, block.number);
	}

	function updateLastPriceForProperty(
		LockupStorage lockupStorage,
		address _property,
		address _user,
		uint256 _lastInterest
	) private {
		lockupStorage.setLastCumulativeGlobalReward(
			_property,
			_user,
			_lastInterest
		);
		lockupStorage.setLastBlockNumber(_property, block.number);
	}

	function validateTargetPeriod(address _property) private {
		(uint256 begin, uint256 end) = term(_property);
		uint256 blocks = end.sub(begin);
		require(
			blocks == 0 ||
				IVoteTimes(config().voteTimes()).validateTargetPeriod(
					_property,
					begin,
					end
				),
			"now abstention penalty"
		);
	}

	function term(address _property)
		private
		view
		returns (uint256 begin, uint256 end)
	{
		return (getStorage().getLastBlockNumber(_property), block.number);
	}

	function dry(LockupStorage lockupStorage)
		private
		view
		returns (uint256 _nextRewards, uint256 _amount)
	{
		uint256 rewardsAmount = IAllocator(config().allocator())
			.calculateMaxRewardsPerBlock();
		(uint256 lastAmount, uint256 lastBlock) = lockupStorage
			.getLastSameRewardsAmountAndBlock();
		uint256 lastMaxRewards = lastAmount == rewardsAmount
			? rewardsAmount
			: lastAmount;

		uint256 blocks = lastBlock > 0 ? block.number.sub(lastBlock) : 0;
		uint256 additionalRewards = lastMaxRewards.mul(blocks);
		uint256 nextRewards = lockupStorage.getCumulativeGlobalRewards().add(
			additionalRewards
		);
		return (nextRewards, rewardsAmount);
	}

	function difference(address _property, uint256 _lastReward)
		public
		view
		returns (
			uint256 _reward,
			uint256 _holdersAmount,
			uint256 _holdersPrice,
			uint256 _interestAmount,
			uint256 _interestPrice
		)
	{
		LockupStorage lockupStorage = getStorage();
		(uint256 rewards, ) = dry(lockupStorage);
		(uint256 valuePerProperty, , ) = getCumulativeLockedUp(_property);
		(uint256 valueAll, , ) = getCumulativeLockedUpAll();
		uint256 propertyRewards = rewards.sub(_lastReward).mul(
			valuePerProperty.mul(Decimals.basis()).outOf(valueAll)
		);
		uint256 lockedUpPerProperty = lockupStorage.getPropertyValue(_property);
		uint256 totalSupply = ERC20Mintable(_property).totalSupply();
		uint256 holders = Policy(config().policy()).holdersShare(
			propertyRewards,
			lockedUpPerProperty
		);
		uint256 interest = propertyRewards.sub(holders);
		return (
			rewards,
			holders,
			holders.div(totalSupply),
			interest,
			lockedUpPerProperty > 0 ? interest.div(lockedUpPerProperty) : 0
		);
	}

	function next(address _property)
		public
		view
		returns (
			uint256 _holders,
			uint256 _interest,
			uint256 _holdersPrice,
			uint256 _interestPrice
		)
	{
		LockupStorage lockupStorage = getStorage();
		(uint256 nextRewards, ) = dry(lockupStorage);
		(uint256 valuePerProperty, , ) = getCumulativeLockedUp(_property);
		(uint256 valueAll, , ) = getCumulativeLockedUpAll();
		uint256 share = valuePerProperty.mul(Decimals.basis()).outOf(valueAll);
		uint256 propertyRewards = nextRewards.mul(share);
		uint256 lockedUp = lockupStorage.getPropertyValue(_property);
		uint256 holders = Policy(config().policy()).holdersShare(
			propertyRewards,
			lockedUp
		);
		uint256 interest = propertyRewards.sub(holders);
		uint256 holdersPrice = holders.div(
			ERC20Mintable(_property).totalSupply()
		);
		uint256 interestPrice = lockedUp > 0 ? interest.div(lockedUp) : 0;
		return (holders, interest, holdersPrice, interestPrice);
	}

	function _calculateInterestAmount(
		LockupStorage lockupStorage,
		address _property,
		address _user
	) private view returns (uint256 _amount, uint256 _interest) {
		uint256 last = lockupStorage.getLastCumulativeGlobalReward(
			_property,
			_user
		);
		(uint256 nextReward, , , , uint256 price) = difference(_property, last);
		uint256 lockedUpPerAccount = lockupStorage.getValue(_property, _user);
		uint256 amount = price.mul(lockedUpPerAccount);
		uint256 result = amount > 0
			? amount.div(Decimals.basis()).div(Decimals.basis())
			: 0;
		return (result, nextReward);
	}

	function _calculateWithdrawableInterestAmount(
		LockupStorage lockupStorage,
		address _property,
		address _user
	) private view returns (uint256 _amount, uint256 _reward) {
		uint256 pending = lockupStorage.getPendingInterestWithdrawal(
			_property,
			_user
		);
		uint256 legacy = __legacyWithdrawableInterestAmount(
			lockupStorage,
			_property,
			_user
		);
		(uint256 amount, uint256 reward) = _calculateInterestAmount(
			lockupStorage,
			_property,
			_user
		);
		uint256 withdrawableAmount = amount
			.add(pending) // solium-disable-next-line indentation
			.add(legacy);
		return (withdrawableAmount, reward);
	}

	function calculateWithdrawableInterestAmount(
		address _property,
		address _user
	) public view returns (uint256) {
		(uint256 amount, ) = _calculateWithdrawableInterestAmount(
			getStorage(),
			_property,
			_user
		);
		return amount;
	}

	function withdrawInterest(address _property) external {
		addressValidator().validateGroup(_property, config().propertyGroup());

		validateTargetPeriod(_property);
		LockupStorage lockupStorage = getStorage();
		(uint256 value, uint256 last) = _calculateWithdrawableInterestAmount(
			lockupStorage,
			_property,
			msg.sender
		);
		require(value > 0, "your interest amount is 0");
		lockupStorage.setPendingInterestWithdrawal(_property, msg.sender, 0);
		ERC20Mintable erc20 = ERC20Mintable(config().token());
		updateLastPriceForProperty(lockupStorage, _property, msg.sender, last);
		__updateLegacyWithdrawableInterestAmount(
			lockupStorage,
			_property,
			msg.sender
		);
		require(erc20.mint(msg.sender, value), "dev mint failed");
		update();
	}

	function updateValues(
		LockupStorage lockupStorage,
		bool _addition,
		address _account,
		address _property,
		uint256 _value
	) private {
		if (_addition) {
			updateCumulativeLockedUp(lockupStorage, true, _property, _value);
			addAllValue(lockupStorage, _value);
			addPropertyValue(lockupStorage, _property, _value);
			addValue(lockupStorage, _property, _account, _value);
		} else {
			updateCumulativeLockedUp(lockupStorage, false, _property, _value);
			subAllValue(lockupStorage, _value);
			subPropertyValue(lockupStorage, _property, _value);
		}
		update();
	}

	function getAllValue() external view returns (uint256) {
		return getStorage().getAllValue();
	}

	function addAllValue(LockupStorage lockupStorage, uint256 _value) private {
		uint256 value = lockupStorage.getAllValue();
		value = value.add(_value);
		lockupStorage.setAllValue(value);
	}

	function subAllValue(LockupStorage lockupStorage, uint256 _value) private {
		uint256 value = lockupStorage.getAllValue();
		value = value.sub(_value);
		lockupStorage.setAllValue(value);
	}

	function getValue(address _property, address _sender)
		external
		view
		returns (uint256)
	{
		return getStorage().getValue(_property, _sender);
	}

	function addValue(
		LockupStorage lockupStorage,
		address _property,
		address _sender,
		uint256 _value
	) private {
		uint256 value = lockupStorage.getValue(_property, _sender);
		value = value.add(_value);
		lockupStorage.setValue(_property, _sender, value);
	}

	function hasValue(address _property, address _sender)
		private
		view
		returns (bool)
	{
		uint256 value = getStorage().getValue(_property, _sender);
		return value != 0;
	}

	function getPropertyValue(address _property)
		external
		view
		returns (uint256)
	{
		return getStorage().getPropertyValue(_property);
	}

	function addPropertyValue(
		LockupStorage lockupStorage,
		address _property,
		uint256 _value
	) private {
		uint256 value = lockupStorage.getPropertyValue(_property);
		value = value.add(_value);
		lockupStorage.setPropertyValue(_property, value);
	}

	function subPropertyValue(
		LockupStorage lockupStorage,
		address _property,
		uint256 _value
	) private {
		uint256 value = lockupStorage.getPropertyValue(_property);
		uint256 nextValue = value.sub(_value);
		lockupStorage.setPropertyValue(_property, nextValue);
	}

	function updatePendingInterestWithdrawal(
		LockupStorage lockupStorage,
		address _property,
		address _user
	) private {
		(uint256 withdrawableAmount, ) = _calculateWithdrawableInterestAmount(
			lockupStorage,
			_property,
			_user
		);
		lockupStorage.setPendingInterestWithdrawal(
			_property,
			_user,
			withdrawableAmount
		);
		__updateLegacyWithdrawableInterestAmount(
			lockupStorage,
			_property,
			_user
		);
	}

	function possible(address _property, address _from)
		private
		view
		returns (bool)
	{
		uint256 blockNumber = getStorage().getWithdrawalStatus(
			_property,
			_from
		);
		if (blockNumber == 0) {
			return false;
		}
		if (blockNumber <= block.number) {
			return true;
		} else {
			if (Policy(config().policy()).lockUpBlocks() == 1) {
				return true;
			}
		}
		return false;
	}

	function __legacyWithdrawableInterestAmount(
		LockupStorage lockupStorage,
		address _property,
		address _user
	) private view returns (uint256) {
		uint256 _last = lockupStorage.getLastInterestPrice(_property, _user);
		uint256 price = lockupStorage.getInterestPrice(_property);
		uint256 priceGap = price.sub(_last);
		uint256 lockedUpValue = lockupStorage.getValue(_property, _user);
		uint256 value = priceGap.mul(lockedUpValue);
		return value.div(Decimals.basis());
	}

	function __updateLegacyWithdrawableInterestAmount(
		LockupStorage lockupStorage,
		address _property,
		address _user
	) private {
		uint256 interestPrice = lockupStorage.getInterestPrice(_property);
		lockupStorage.setLastInterestPrice(_property, _user, interestPrice);
	}

	function getStorage() private view returns (LockupStorage) {
		require(paused() == false, "You cannot use that");
		return LockupStorage(config().lockupStorage());
	}
}
