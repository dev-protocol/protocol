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
import {IWithdraw} from "contracts/src/withdraw/IWithdraw.sol";
import {ILockup} from "contracts/src/lockup/ILockup.sol";

contract Lockup is ILockup, Pausable, UsingConfig, UsingValidator {
	using SafeMath for uint256;
	using Decimals for uint256;
	event Lockedup(address _from, address _property, uint256 _value);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

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
		if (IWithdraw(config().withdraw()).getLastBlockNumber(_property) == 0) {
			IWithdraw(config().withdraw()).setLastBlockNumber(
				_property,
				block.number
			);
		}
		if (
			IWithdraw(config().withdraw())
				.getLastCumulativeGlobalHoldersPriceEachProperty(_property) == 0
		) {
			(, , , , uint256 price) = next(_property);
			IWithdraw(config().withdraw())
				.setLastCumulativeGlobalHoldersPriceEachProperty(
				_property,
				price
			);
		}
		update();
		updatePendingInterestWithdrawal(_property, _from);
		addValue(_property, _from, _value);
		addPropertyValue(_property, _value);
		addAllValue(_value);
		update();
		updateLastPriceForProperty(_property, _from);
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
		updatePendingInterestWithdrawal(_property, msg.sender);
		update();
		Property(_property).withdraw(msg.sender, lockedUpValue);
		lockupStorage.setValue(_property, msg.sender, 0);
		subPropertyValue(_property, lockedUpValue);
		subAllValue(lockedUpValue);
		lockupStorage.setWithdrawalStatus(_property, msg.sender, 0);
		update();
	}

	function update() public {
		(uint256 _nextRewards, uint256 _nextPrice, , uint256 _maxPrice) = dry();
		LockupStorage lockupStorage = getStorage();
		if (lockupStorage.getCumulativeGlobalRewards() != _nextRewards)
			lockupStorage.setCumulativeGlobalRewards(_nextRewards);
		if (lockupStorage.getCumulativeGlobalRewardsPrice() != _nextPrice)
			lockupStorage.setCumulativeGlobalRewardsPrice(_nextPrice);
		if (lockupStorage.getLastMaxRewardsPrice() != _maxPrice)
			lockupStorage.setLastMaxRewardsPrice(_maxPrice);
		if (lockupStorage.getLastSameRewardsPriceBlock() != block.number)
			lockupStorage.setLastSameRewardsPriceBlock(block.number);
	}

	function updateLastPriceForProperty(address _property, address _user)
		private
	{
		(, , , uint256 interestPrice, ) = next(_property);
		LockupStorage lockupStorage = getStorage();
		lockupStorage.setLastCumulativeGlobalInterestPrice(
			_property,
			_user,
			interestPrice
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

	function dry()
		private
		view
		returns (
			uint256 _rewards,
			uint256 _price,
			uint256 _maxRewards,
			uint256 _maxPrice
		)
	{
		(, , uint256 maxRewards) = IAllocator(config().allocator())
			.calculateMaxRewardsPerBlock();
		LockupStorage lockupStorage = getStorage();
		uint256 lockedUp = lockupStorage.getAllValue();
		uint256 maxPrice = lockedUp > 0 ? maxRewards.outOf(lockedUp) : 0;
		uint256 lastBlock = maxPrice == lockupStorage.getLastMaxRewardsPrice()
			? lockupStorage.getLastSameRewardsPriceBlock()
			: 0;
		uint256 blocks = lastBlock > 0 ? block.number.sub(lastBlock) : 0;
		uint256 additionalRewards = maxRewards.mul(blocks);
		uint256 additionalPrice = maxPrice.mul(blocks);
		uint256 nextRewards = lockupStorage.getCumulativeGlobalRewards().add(
			additionalRewards
		);
		uint256 nextPrice = lockupStorage.getCumulativeGlobalRewardsPrice().add(
			additionalPrice
		);
		return (nextRewards, nextPrice, maxRewards, maxPrice);
	}

	function next(address _property)
		public
		view
		returns (
			uint256 _holders,
			uint256 _interest,
			uint256 _holdersPrice,
			uint256 _interestPrice,
			uint256 _holdersPriceByShare
		)
	{
		(uint256 maxRewards, uint256 nextPrice, , ) = dry();
		LockupStorage lockupStorage = getStorage();

		uint256 lockedUp = lockupStorage.getPropertyValue(_property);
		if (lockedUp == 0) {
			lockedUp = lockupStorage.getJustBeforeReduceToZero(_property);
		}
		uint256 propertyRewards = nextPrice.mul(lockedUp);
		uint256 holders = Policy(config().policy()).holdersShare(
			propertyRewards,
			lockedUp
		);
		uint256 interest = propertyRewards.sub(holders);
		uint256 holdersPrice = holders.div(
			ERC20Mintable(_property).totalSupply()
		);
		uint256 holdersPriceByShare = Policy(config().policy())
			.holdersShare(
			maxRewards.mul(lockedUp.outOf(lockupStorage.getAllValue())),
			lockedUp
		)
			.div(ERC20Mintable(_property).totalSupply());
		uint256 interestPrice = lockedUp > 0 ? interest.div(lockedUp) : 0;
		return (
			holders,
			interest,
			holdersPrice,
			interestPrice,
			holdersPriceByShare
		);
	}

	function _calculateInterestAmount(address _property, address _user)
		private
		view
		returns (uint256)
	{
		LockupStorage lockupStorage = getStorage();
		uint256 lockedUp = lockupStorage.getValue(_property, _user);
		if (lockedUp == 0) {
			return 0;
		}
		uint256 lastPrice = lockupStorage.getLastCumulativeGlobalInterestPrice(
			_property,
			_user
		);
		(, , , uint256 interestPrice, ) = next(_property);
		uint256 priceGap = interestPrice.sub(lastPrice);
		uint256 value = priceGap.mul(lockedUp);
		return value > 0 ? value.div(Decimals.basis()) : 0;
	}

	function _calculateWithdrawableInterestAmount(
		address _property,
		address _user
	) private view returns (uint256) {
		uint256 pending = getStorage().getPendingInterestWithdrawal(
			_property,
			_user
		);
		uint256 legacy = __legacyWithdrawableInterestAmount(_property, _user);
		return
			_calculateInterestAmount(_property, _user).add(pending).add(legacy);
	}

	function withdrawInterest(address _property) external {
		addressValidator().validateGroup(_property, config().propertyGroup());

		validateTargetPeriod(_property);
		uint256 value = _calculateWithdrawableInterestAmount(
			_property,
			msg.sender
		);
		require(value > 0, "your interest amount is 0");
		getStorage().setPendingInterestWithdrawal(_property, msg.sender, 0);
		ERC20Mintable erc20 = ERC20Mintable(config().token());
		updateLastPriceForProperty(_property, msg.sender);
		__updateLegacyWithdrawableInterestAmount(_property, msg.sender);
		require(erc20.mint(msg.sender, value), "dev mint failed");
		update();
	}

	function getAllValue() external view returns (uint256) {
		return getStorage().getAllValue();
	}

	function addAllValue(uint256 _value) private {
		LockupStorage lockupStorage = getStorage();
		uint256 value = lockupStorage.getAllValue();
		value = value.add(_value);
		lockupStorage.setAllValue(value);
	}

	function subAllValue(uint256 _value) private {
		LockupStorage lockupStorage = getStorage();
		uint256 value = lockupStorage.getAllValue();
		value = value.sub(_value);
		lockupStorage.setAllValue(value);
	}

	function getPropertyValue(address _property)
		external
		view
		returns (uint256)
	{
		return getStorage().getPropertyValue(_property);
	}

	function getValue(address _property, address _sender)
		external
		view
		returns (uint256)
	{
		return getStorage().getValue(_property, _sender);
	}

	function addValue(
		address _property,
		address _sender,
		uint256 _value
	) private {
		LockupStorage lockupStorage = getStorage();
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

	function addPropertyValue(address _property, uint256 _value) private {
		LockupStorage lockupStorage = getStorage();
		uint256 value = lockupStorage.getPropertyValue(_property);
		value = value.add(_value);
		lockupStorage.setPropertyValue(_property, value);
	}

	function subPropertyValue(address _property, uint256 _value) private {
		LockupStorage lockupStorage = getStorage();
		uint256 value = lockupStorage.getPropertyValue(_property);
		uint256 nextValue = value.sub(_value);
		lockupStorage.setPropertyValue(_property, nextValue);
		if (nextValue == 0) {
			lockupStorage.setJustBeforeReduceToZero(_property, value);
		}
	}

	function updatePendingInterestWithdrawal(address _property, address _user)
		private
	{
		LockupStorage lockupStorage = getStorage();
		uint256 pending = lockupStorage.getPendingInterestWithdrawal(
			_property,
			_user
		);
		lockupStorage.setPendingInterestWithdrawal(
			_property,
			_user,
			_calculateInterestAmount(_property, _user).add(pending)
		);
		__updateLegacyWithdrawableInterestAmount(_property, _user);
	}

	function possible(address _property, address _from)
		private
		view
		returns (bool)
	{
		// The behavior is changing because of a patch for DIP3.
		// uint256 blockNumber = getStorage().getWithdrawalStatus(
		// 	_property,
		// 	_from
		// );
		// if (blockNumber == 0) {
		// 	return false;
		// }
		// return blockNumber <= block.number;

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
		address _property,
		address _user
	) private view returns (uint256) {
		LockupStorage lockupStorage = getStorage();
		uint256 _last = lockupStorage.getLastInterestPrice(_property, _user);
		uint256 price = lockupStorage.getInterestPrice(_property);
		uint256 priceGap = price.sub(_last);
		uint256 lockedUpValue = lockupStorage.getValue(_property, _user);
		uint256 value = priceGap.mul(lockedUpValue);
		return value.div(Decimals.basis());
	}

	function __updateLegacyWithdrawableInterestAmount(
		address _property,
		address _user
	) private {
		LockupStorage lockupStorage = getStorage();
		uint256 interestPrice = lockupStorage.getInterestPrice(_property);
		lockupStorage.setLastInterestPrice(_property, _user, interestPrice);
	}

	function getStorage() private view returns (LockupStorage) {
		require(paused() == false, "You cannot use that");
		return LockupStorage(config().lockupStorage());
	}
}
