pragma solidity ^0.5.0;

// prettier-ignore
import {ERC20Mintable} from "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {Decimals} from "contracts/src/common/libs/Decimals.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {WithdrawStorage} from "contracts/src/withdraw/WithdrawStorage.sol";
import {IWithdraw} from "contracts/src/withdraw/IWithdraw.sol";
import {ILockup} from "contracts/src/lockup/ILockup.sol";

contract Withdraw is IWithdraw, Pausable, UsingConfig, UsingValidator {
	using SafeMath for uint256;
	using Decimals for uint256;

	// event Log(string, uint);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function withdraw(address _property) external {
		addressValidator().validateGroup(_property, config().propertyGroup());

		(uint256 value, uint256 lastPrice) = _calculateWithdrawableAmount(
			_property,
			msg.sender
		);
		require(value != 0, "withdraw value is 0");
		WithdrawStorage withdrawStorage = getStorage();
		withdrawStorage.setLastCumulativeGlobalHoldersPrice(
			_property,
			msg.sender,
			lastPrice
		);
		withdrawStorage.setPendingWithdrawal(_property, msg.sender, 0);
		__updateLegacyWithdrawableAmount(_property, msg.sender);
		ERC20Mintable erc20 = ERC20Mintable(config().token());
		ILockup lockup = ILockup(config().lockup());
		require(erc20.mint(msg.sender, value), "dev mint failed");
		lockup.update();
		withdrawStorage.setRewardsAmount(
			_property,
			withdrawStorage.getRewardsAmount(_property).add(value)
		);
	}

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
	) external {
		addressValidator().validateAddress(msg.sender, config().allocator());
		WithdrawStorage withdrawStorage = getStorage();

		(uint256 amountFrom, uint256 priceFrom) = _calculateAmount(
			_property,
			_from
		);
		(uint256 amountTo, uint256 priceTo) = _calculateAmount(_property, _to);
		withdrawStorage.setLastCumulativeGlobalHoldersPrice(
			_property,
			_from,
			priceFrom
		);
		withdrawStorage.setLastCumulativeGlobalHoldersPrice(
			_property,
			_to,
			priceTo
		);
		uint256 pendFrom = withdrawStorage.getPendingWithdrawal(
			_property,
			_from
		);
		uint256 pendTo = withdrawStorage.getPendingWithdrawal(_property, _to);
		withdrawStorage.setPendingWithdrawal(
			_property,
			_from,
			pendFrom.add(amountFrom)
		);
		withdrawStorage.setPendingWithdrawal(
			_property,
			_to,
			pendTo.add(amountTo)
		);
		uint256 totalLimit = withdrawStorage.getWithdrawalLimitTotal(
			_property,
			_to
		);
		(, uint256 total, , , ) = difference(withdrawStorage, _property, _to);
		if (totalLimit != total) {
			withdrawStorage.setWithdrawalLimitTotal(_property, _to, total);
			withdrawStorage.setWithdrawalLimitBalance(
				_property,
				_to,
				ERC20Mintable(_property).balanceOf(_to)
			);
		}
	}

	function getRewardsAmount(address _property)
		external
		view
		returns (uint256)
	{
		return getStorage().getRewardsAmount(_property);
	}

	function difference(
		WithdrawStorage withdrawStorage,
		address _property,
		address _user
	)
		private
		view
		returns (
			uint256 _reward,
			uint256 _holdersAmount,
			uint256 _holdersPrice,
			uint256 _interestAmount,
			uint256 _interestPrice
		)
	{
		uint256 _last = withdrawStorage.getLastCumulativeGlobalHoldersPrice(
			_property,
			_user
		);
		return ILockup(config().lockup()).difference(_property, _last);
	}

	function _calculateAmount(address _property, address _user)
		private
		view
		returns (uint256 _amount, uint256 _price)
	{
		WithdrawStorage withdrawStorage = getStorage();
		uint256 totalLimit = withdrawStorage.getWithdrawalLimitTotal(
			_property,
			_user
		);
		uint256 balanceLimit = withdrawStorage.getWithdrawalLimitBalance(
			_property,
			_user
		);
		(
			uint256 reward,
			uint256 _holders,
			uint256 _holdersPrice,
			,

		) = difference(withdrawStorage, _property, _user);
		uint256 balance = ERC20Mintable(_property).balanceOf(_user);
		if (totalLimit == _holders) {
			balance = balanceLimit;
		}
		uint256 value = _holdersPrice.mul(balance);
		return (value.div(Decimals.basis()).div(Decimals.basis()), reward);
	}

	function _calculateWithdrawableAmount(address _property, address _user)
		private
		view
		returns (uint256 _amount, uint256 _price)
	{
		(uint256 _value, uint256 price) = _calculateAmount(_property, _user);
		uint256 legacy = __legacyWithdrawableAmount(_property, _user);
		uint256 value = _value
			.add(getStorage().getPendingWithdrawal(_property, _user))
			.add(legacy);
		return (value, price);
	}

	function calculateWithdrawableAmount(address _property, address _user)
		external
		view
		returns (uint256)
	{
		(uint256 value, ) = _calculateWithdrawableAmount(_property, _user);
		return value;
	}

	function calculateTotalWithdrawableAmount(address _property)
		external
		view
		returns (uint256)
	{
		(, uint256 _amount, , , ) = ILockup(config().lockup()).difference(
			_property,
			0
		);
		return _amount;
	}

	function __legacyWithdrawableAmount(address _property, address _user)
		private
		view
		returns (uint256)
	{
		WithdrawStorage withdrawStorage = getStorage();
		uint256 _last = withdrawStorage.getLastWithdrawalPrice(
			_property,
			_user
		);
		uint256 price = withdrawStorage.getCumulativePrice(_property);
		uint256 priceGap = price.sub(_last);
		uint256 balance = ERC20Mintable(_property).balanceOf(_user);
		uint256 value = priceGap.mul(balance);
		return value.div(Decimals.basis());
	}

	function __updateLegacyWithdrawableAmount(address _property, address _user)
		private
	{
		WithdrawStorage withdrawStorage = getStorage();
		uint256 price = withdrawStorage.getCumulativePrice(_property);
		withdrawStorage.setLastWithdrawalPrice(_property, _user, price);
	}

	function getStorage() private view returns (WithdrawStorage) {
		require(paused() == false, "You cannot use that");
		return WithdrawStorage(config().withdrawStorage());
	}
}
