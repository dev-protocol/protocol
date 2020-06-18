pragma solidity ^0.5.0;

// prettier-ignore
import {ERC20Mintable} from "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {Decimals} from "contracts/src/common/libs/Decimals.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {WithdrawStorage} from "contracts/src/withdraw/WithdrawStorage.sol";
import {IAllocator} from "contracts/src/allocator/IAllocator.sol";
import {IVoteTimes} from "contracts/src/vote/times/IVoteTimes.sol";
import {IWithdraw} from "contracts/src/withdraw/IWithdraw.sol";
import {ILockup} from "contracts/src/lockup/ILockup.sol";

contract Withdraw is IWithdraw, Pausable, UsingConfig, UsingValidator {
	using SafeMath for uint256;
	using Decimals for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function withdraw(address _property) external {
		addressValidator().validateGroup(_property, config().propertyGroup());

		(uint256 value, uint256 lastPrice) = _calculateWithdrawableAmount(
			_property,
			msg.sender
		);
		require(value != 0, "withdraw value is 0");
		// update(_property);
		// uint256 price = getStorage().getCumulativePrice(_property);
		// getStorage().setLastWithdrawalPrice(_property, msg.sender, _holdersPrice);
		getStorage().setLastCumulativeGlobalHoldersPrice(
			_property,
			msg.sender,
			lastPrice
		);
		getStorage().setPendingWithdrawal(_property, msg.sender, 0);
		__updateLegacyWithdrawableAmount(_property, msg.sender);
		ERC20Mintable erc20 = ERC20Mintable(config().token());
		ILockup lockup = ILockup(config().lockup());
		lockup.update();
		require(erc20.mint(msg.sender, value), "dev mint failed");
		lockup.update();
	}

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
	) external {
		addressValidator().validateAddress(msg.sender, config().allocator());

		uint256 price = getStorage().getCumulativePrice(_property);
		(uint256 amountFrom, ) = _calculateAmount(_property, _from);
		(uint256 amountTo, ) = _calculateAmount(_property, _to);
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
				ERC20Mintable(_property).balanceOf(_to)
			);
		}
	}

	// function update(address _property) private {
	// 	(uint256 begin, uint256 end) = term(_property);
	// 	require(
	// 		IVoteTimes(config().voteTimes()).validateTargetPeriod(
	// 			_property,
	// 			begin,
	// 			end
	// 		),
	// 		"now abstention penalty"
	// 	);
	// 	(uint256 nextTotal, uint256 nextPrice) = dry(_property);
	// 	getStorage().setRewardsAmount(_property, nextTotal);
	// 	getStorage().setCumulativePrice(_property, nextPrice);
	// 	getStorage().setLastBlockNumber(_property, block.number);
	// }

	// function term(address _property)
	// 	private
	// 	view
	// 	returns (uint256 _begin, uint256 _end)
	// {
	// 	return (getStorage().getLastBlockNumber(_property), block.number);
	// }

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
		returns (uint256 _amount, uint256 _price)
	{
		uint256 _last = getStorage().getLastCumulativeGlobalHoldersPrice(
			_property,
			_user
		);
		uint256 totalLimit = getStorage().getWithdrawalLimitTotal(
			_property,
			_user
		);
		uint256 propertyLimit = getStorage()
			.getLastCumulativeGlobalHoldersPriceEachProperty(_property);
		uint256 balanceLimit = getStorage().getWithdrawalLimitBalance(
			_property,
			_user
		);
		(uint256 _holders, , uint256 _holdersPrice, ) = ILockup(
			config().lockup()
		)
			.next(_property);
		uint256 priceGap = _holdersPrice.sub(_last).sub(
			_last >= propertyLimit ? 0 : propertyLimit
		);
		uint256 balance = ERC20Mintable(_property).balanceOf(_user);
		if (totalLimit == _holders) {
			balance = balanceLimit;
		}
		uint256 value = priceGap.mul(balance);
		return (value.div(Decimals.basis()), _holdersPrice);
	}

	function calculateAmount(address _property, address _user)
		external
		view
		returns (uint256)
	{
		(uint256 value, ) = _calculateAmount(_property, _user);
		return value;
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

	function setLastBlockNumber(address _property, uint256 _blockNumber)
		external
	{
		getStorage().setLastBlockNumber(_property, _blockNumber);
	}

	function getLastBlockNumber(address _property)
		external
		view
		returns (uint256)
	{
		return getStorage().getLastBlockNumber(_property);
	}

	function setLastCumulativeGlobalHoldersPriceEachProperty(
		address _property,
		uint256 _value
	) external {
		getStorage().setLastCumulativeGlobalHoldersPriceEachProperty(
			_property,
			_value
		);
	}

	function getLastCumulativeGlobalHoldersPriceEachProperty(address _property)
		external
		view
		returns (uint256)
	{
		return
			getStorage().getLastCumulativeGlobalHoldersPriceEachProperty(
				_property
			);
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
