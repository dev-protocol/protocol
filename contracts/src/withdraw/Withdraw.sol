pragma solidity ^0.5.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// prettier-ignore
import {ERC20Mintable} from "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {Decimals} from "contracts/src/common/libs/Decimals.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {PropertyGroup} from "contracts/src/property/PropertyGroup.sol";
import {WithdrawStorage} from "contracts/src/withdraw/WithdrawStorage.sol";
import {IAllocator} from "contracts/src/allocator/IAllocator.sol";

contract Withdraw is Pausable, UsingConfig, UsingValidator {
	using SafeMath for uint256;
	using Decimals for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function withdraw(address _property) external {
		addressValidator().validateGroup(_property, config().propertyGroup());

		uint256 value = _calculateWithdrawableAmount(_property, msg.sender);
		require(value != 0, "withdraw value is 0");
		uint256 price = getStorage().getCumulativePrice(_property);
		getStorage().setLastWithdrawalPrice(_property, msg.sender, price);
		getStorage().setPendingWithdrawal(_property, msg.sender, 0);
		ERC20Mintable erc20 = ERC20Mintable(config().token());
		require(erc20.mint(msg.sender, value), "dev mint failed");
	}

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
	) external {
		addressValidator().validateAddress(msg.sender, config().allocator());

		uint256 price = getStorage().getCumulativePrice(_property);
		uint256 amountFrom = _calculateAmount(_property, _from);
		uint256 amountTo = _calculateAmount(_property, _to);
		getStorage().setLastWithdrawalPrice(_property, _from, price);
		getStorage().setLastWithdrawalPrice(_property, _to, price);
		uint256 pendFrom = getStorage().getPendingWithdrawal(_property, _from);
		uint256 pendTo = getStorage().getPendingWithdrawal(_property, _to);
		getStorage().setPendingWithdrawal(
			_property,
			_from,
			pendFrom.add(amountFrom)
		);
		getStorage().setPendingWithdrawal(_property, _to, pendTo.add(amountTo));
		uint256 totalLimit = getStorage().getWithdrawalLimitTotal(
			_property,
			_to
		);
		uint256 total = getStorage().getRewardsAmount(_property);
		if (totalLimit != total) {
			getStorage().setWithdrawalLimitTotal(_property, _to, total);
			getStorage().setWithdrawalLimitBalance(
				_property,
				_to,
				ERC20(_property).balanceOf(_to)
			);
		}
	}

	function next(address _property, uint256 _allocationResult)
		private
		view
		returns (uint256 _total, uint256 _price)
	{
		uint256 priceValue = _allocationResult.outOf(
			ERC20(_property).totalSupply()
		);
		uint256 total = getStorage().getRewardsAmount(_property);
		uint256 price = getStorage().getCumulativePrice(_property);
		return (total.add(_allocationResult), price.add(priceValue));
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
		(uint256 nextTotal, uint256 nextPrice) = dry(_property);
		getStorage().setRewardsAmount(_property, nextTotal);
		getStorage().setCumulativePrice(_property, nextPrice);
		getStorage().setLastBlockNumber(_property, block.number);
	}

	function term(address _property)
		private
		view
		returns (uint256 _begin, uint256 _end)
	{
		return (getStorage().getLastBlockNumber(_property), block.number);
	}

	function dry(address _property)
		private
		view
		returns (uint256 _total, uint256 _price)
	{
		(uint256 begin, uint256 end) = term(_property);
		(uint256 holder,) = IAllocator(config().allocator()).calculate(
			_property,
			begin,
			end
		);
		(uint256 total, uint256 price) = next(_property, holder);
		return (total, price);
	}

	function getRewardsAmount(address _property)
		external
		view
		returns (uint256)
	{
		return getStorage().getRewardsAmount(_property);
	}

	function _calculateAmount(address _property, address _user)
		private
		view
		returns (uint256)
	{
		uint256 _last = getStorage().getLastWithdrawalPrice(_property, _user);
		uint256 totalLimit = getStorage().getWithdrawalLimitTotal(
			_property,
			_user
		);
		uint256 balanceLimit = getStorage().getWithdrawalLimitBalance(
			_property,
			_user
		);
		uint256 price = getStorage().getCumulativePrice(_property);
		(uint256 dryTotal, uint256 dryPrice) = dry(_property);
		uint256 priceGap = price.sub(_last);
		uint256 dryPriceGap = dryPrice.sub(price);
		uint256 balance = ERC20(_property).balanceOf(_user);
		if (totalLimit == dryTotal) {
			balance = balanceLimit;
		}
		uint256 value = priceGap.mul(balance);
		uint256 dryValue = dryPriceGap.mul(balance);
		return value.add(dryValue).div(Decimals.basis());
	}

	function calculateAmount(address _property, address _user)
		external
		view
		returns (uint256)
	{
		return _calculateAmount(_property, _user);
	}

	function _calculateWithdrawableAmount(address _property, address _user)
		private
		view
		returns (uint256)
	{
		uint256 _value = _calculateAmount(_property, _user);
		uint256 value = _value.add(
			getStorage().getPendingWithdrawal(_property, _user)
		);
		return value;
	}

	function calculateWithdrawableAmount(address _property, address _user)
		external
		view
		returns (uint256)
	{
		return _calculateWithdrawableAmount(_property, _user);
	}

	function getStorage() private view returns (WithdrawStorage) {
		require(paused() == false, "You cannot use that");
		return WithdrawStorage(config().withdrawStorage());
	}
}
