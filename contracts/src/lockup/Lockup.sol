pragma solidity ^0.5.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// prettier-ignore
import {ERC20Mintable} from "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {Decimals} from "contracts/src/common/libs/Decimals.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {Property} from "contracts/src/property/Property.sol";
import {PropertyGroup} from "contracts/src/property/PropertyGroup.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {LockupStorage} from "contracts/src/lockup/LockupStorage.sol";
import {Policy} from "contracts/src/policy/Policy.sol";
import {IAllocator} from "contracts/src/allocator/IAllocator.sol";
import {Withdraw} from "contracts/src/withdraw/Withdraw.sol";

contract Lockup is Pausable, UsingConfig, UsingValidator {
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
		if (Withdraw(config().withdraw()).getLastBlockNumber(_property) == 0) {
			Withdraw(config().withdraw()).setLastBlockNumber(
				_property,
				block.number
			);
		}
		update(_property);
		updatePendingInterestWithdrawal(_property, _from);
		addValue(_property, _from, _value);
		addPropertyValue(_property, _value);
		addAllValue(_value);
		getStorage().setLastInterestPrice(
			_property,
			_from,
			getStorage().getInterestPrice(_property)
		);
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
	}

	function next(address _property, uint256 _priceValue)
		private
		view
		returns (uint256)
	{
		uint256 result = _priceValue.outOf(
			getStorage().getPropertyValue(_property)
		);
		uint256 price = getStorage().getInterestPrice(_property);
		return price.add(result);
	}

	function update(address _property) private {
		(uint256 begin, uint256 end) = term(_property);
		require(
			IAllocator(config().allocator()).validateTargetPeriod(
				_property,
				begin,
				end
			),
			"now abstention penalty"
		);
		uint256 nextPrice = dry(_property);
		getStorage().setInterestPrice(_property, nextPrice);
		getStorage().setLastBlockNumber(_property, end);
	}

	function term(address _property)
		private
		view
		returns (uint256 begin, uint256 end)
	{
		return (getStorage().getLastBlockNumber(_property), block.number);
	}

	function dry(address _property) private view returns (uint256) {
		(uint256 begin, uint256 end) = term(_property);
		(, uint256 interest) = IAllocator(config().allocator()).calculate(
			_property,
			begin,
			end
		);
		return next(_property, interest);
	}

	function _calculateInterestAmount(address _property, address _user)
		private
		view
		returns (uint256)
	{
		uint256 _last = getStorage().getLastInterestPrice(_property, _user);
		uint256 price = getStorage().getInterestPrice(_property);
		uint256 dryPrice = dry(_property);
		uint256 priceGap = price.sub(_last);
		uint256 dryPriceGap = dryPrice.sub(price);
		uint256 lockupedValue = getStorage().getValue(_property, _user);
		uint256 value = priceGap.mul(lockupedValue);
		uint256 dryValue = dryPriceGap.mul(lockupedValue);
		return value.add(dryValue).div(Decimals.basis());
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

		update(_property);
		uint256 value = _calculateWithdrawableInterestAmount(
			_property,
			msg.sender
		);
		require(value > 0, "your interest amount is 0");
		getStorage().setLastInterestPrice(
			_property,
			msg.sender,
			getStorage().getInterestPrice(_property)
		);
		getStorage().setPendingInterestWithdrawal(_property, msg.sender, 0);
		ERC20Mintable erc20 = ERC20Mintable(config().token());
		require(erc20.mint(msg.sender, value), "dev mint failed");
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
