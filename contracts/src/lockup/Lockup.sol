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

		bool isWaiting = getStorage().getWithdrawalStatus(_property, _from) !=
			0;
		require(isWaiting == false, "lockup is already canceled");
		if (getStorage().getLastBlockNumber(_property) == 0) {
			// Set the block that has been locked-up for the first time as the starting block.
			getStorage().setLastBlockNumber(_property, block.number);
		}
		if (IWithdraw(config().withdraw()).getLastBlockNumber(_property) == 0) {
			IWithdraw(config().withdraw()).setLastBlockNumber(
				_property,
				block.number
			);
		}
		update();
		updatePendingInterestWithdrawal(_property, _from);
		updateLastPriceForProperty(_property, _from);
		addValue(_property, _from, _value);
		addPropertyValue(_property, _value);
		addAllValue(_value);
		update();
		emit Lockedup(_from, _property, _value);
	}

	function cancel(address _property) external {
		addressValidator().validateGroup(_property, config().propertyGroup());

		require(hasValue(_property, msg.sender), "dev token is not locked");
		bool isWaiting = getStorage().getWithdrawalStatus(
			_property,
			msg.sender
		) != 0;
		require(isWaiting == false, "lockup is already canceled");
		uint256 blockNumber = Policy(config().policy()).lockUpBlocks();
		blockNumber = blockNumber.add(block.number);
		getStorage().setWithdrawalStatus(_property, msg.sender, blockNumber);
	}

	function withdraw(address _property) external {
		addressValidator().validateGroup(_property, config().propertyGroup());

		require(possible(_property, msg.sender), "waiting for release");
		uint256 lockupedValue = getStorage().getValue(_property, msg.sender);
		require(lockupedValue != 0, "dev token is not locked");
		updatePendingInterestWithdrawal(_property, msg.sender);
		Property(_property).withdraw(msg.sender, lockupedValue);
		getStorage().setValue(_property, msg.sender, 0);
		subPropertyValue(_property, lockupedValue);
		subAllValue(lockupedValue);
		getStorage().setWithdrawalStatus(_property, msg.sender, 0);
		updateLastPriceForProperty(_property, msg.sender);
	}

	function update() public {
		(
			uint256 _nextRewards,
			uint256 _nextPrice,
			uint256 _maxRewards,
			uint256 _maxPrice
		) = dry();
		// uint256 lastRewards = getStorage().getLastMaxRewards();
		// uint256 lastPrice = getStorage().getLastMaxRewardsPrice();
		// if (_maxRewards != lastRewards || _maxPrice != lastPrice) {
		getStorage().setCumulativeGlobalRewards(_nextRewards);
		getStorage().setCumulativeGlobalRewardsPrice(_nextPrice);
		getStorage().setLastMaxRewards(_maxRewards);
		getStorage().setLastMaxRewardsPrice(_maxPrice);
		getStorage().setLastSameRewardsBlock(block.number);
		// }
	}

	function updateLastPriceForProperty(address _property, address _user)
		private
	{
		(, , , uint256 interestPrice) = next(_property);
		emit Log("updateProperty: interestPrice", interestPrice);
		emit Log("updateProperty: user", _user);
		getStorage().setLastInterestPrice(_property, _user, interestPrice);
		getStorage().setLastBlockNumber(_property, block.number);
		emit Log(
			"updateProperty: getLastInterestPrice",
			getStorage().getLastInterestPrice(_property, _user)
		);
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
		public
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
		uint256 lastMaxRewards = getStorage().getLastMaxRewards();
		uint256 prevRewards = getStorage().getCumulativeGlobalRewards();
		uint256 prevPrice = getStorage().getCumulativeGlobalRewardsPrice();
		uint256 lockedUp = getStorage().getAllValue();
		uint256 maxPrice = lockedUp > 0 ? maxRewards.outOf(lockedUp) : 0;
		uint256 lastBlock = maxRewards == lastMaxRewards
			? getStorage().getLastSameRewardsBlock()
			: 0;
		uint256 blocks = lastBlock > 0 ? block.number.sub(lastBlock) : 0;
		uint256 additionalRewards = maxRewards.mul(blocks);
		uint256 additionalPrice = maxPrice.mul(blocks);
		uint256 nextRewards = prevRewards.add(additionalRewards);
		uint256 nextPrice = prevPrice.add(additionalPrice);
		return (nextRewards, nextPrice, maxRewards, maxPrice);
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
		(, uint256 nextPrice, , ) = dry();
		uint256 lockedUp = getStorage().getPropertyValue(_property);
		uint256 propertyRewards = nextPrice.div(Decimals.basis()).mul(lockedUp);
		uint256 holders = Policy(config().policy()).holdersShare(
			propertyRewards,
			lockedUp
		);
		uint256 interest = propertyRewards.sub(holders);
		uint256 holdersPrice = holders.outOf(
			ERC20Mintable(_property).totalSupply()
		);
		uint256 interestPrice = lockedUp > 0 ? interest.outOf(lockedUp) : 0;
		return (holders, interest, holdersPrice, interestPrice);
	}

	function _calculateInterestAmount(address _property, address _user)
		private
		view
		returns (uint256)
	{
		uint256 lockupedValue = getStorage().getValue(_property, _user);
		uint256 lastPrice = getStorage().getLastInterestPrice(_property, _user);
		(, , , uint256 interestPrice) = next(_property);
		uint256 priceGap = interestPrice.sub(lastPrice);
		uint256 value = priceGap.mul(lockupedValue);
		return value > 0 ? value.div(Decimals.basis()) : 0;
	}

	function calculateInterestAmount(address _property, address _user)
		external
		view
		returns (uint256)
	{
		return _calculateInterestAmount(_property, _user);
	}

	function _calculateWithdrawableInterestAmount(
		address _property,
		address _user
	) private view returns (uint256) {
		uint256 pending = getStorage().getPendingInterestWithdrawal(
			_property,
			_user
		);
		return _calculateInterestAmount(_property, _user).add(pending);
	}

	function calculateWithdrawableInterestAmount(
		address _property,
		address _user
	) external view returns (uint256) {
		return _calculateWithdrawableInterestAmount(_property, _user);
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
		require(erc20.mint(msg.sender, value), "dev mint failed");
		update();
	}

	function getAllValue() external view returns (uint256) {
		return getStorage().getAllValue();
	}

	function addAllValue(uint256 _value) private {
		uint256 value = getStorage().getAllValue();
		value = value.add(_value);
		getStorage().setAllValue(value);
	}

	function subAllValue(uint256 _value) private {
		uint256 value = getStorage().getAllValue();
		value = value.sub(_value);
		getStorage().setAllValue(value);
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
		uint256 value = getStorage().getValue(_property, _sender);
		value = value.add(_value);
		getStorage().setValue(_property, _sender, value);
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
		uint256 value = getStorage().getPropertyValue(_property);
		value = value.add(_value);
		getStorage().setPropertyValue(_property, value);
	}

	function subPropertyValue(address _property, uint256 _value) private {
		uint256 value = getStorage().getPropertyValue(_property);
		value = value.sub(_value);
		getStorage().setPropertyValue(_property, value);
	}

	function updatePendingInterestWithdrawal(address _property, address _user)
		private
	{
		uint256 pending = getStorage().getPendingInterestWithdrawal(
			_property,
			_user
		);
		getStorage().setPendingInterestWithdrawal(
			_property,
			_user,
			_calculateInterestAmount(_property, _user).add(pending)
		);
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

	function getStorage() private view returns (LockupStorage) {
		require(paused() == false, "You cannot use that");
		return LockupStorage(config().lockupStorage());
	}
}
