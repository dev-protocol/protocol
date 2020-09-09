pragma solidity ^0.5.0;

// prettier-ignore
import {ERC20Mintable} from "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Decimals} from "contracts/src/common/libs/Decimals.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {WithdrawStorage} from "contracts/src/withdraw/WithdrawStorage.sol";
import {IWithdraw} from "contracts/src/withdraw/IWithdraw.sol";
import {ILockup} from "contracts/src/lockup/ILockup.sol";
import {IMetricsGroup} from "contracts/src/metrics/IMetricsGroup.sol";

/**
 * A contract that manages the withdrawal of holder rewards for Property holders.
 */
contract Withdraw is IWithdraw, UsingConfig, UsingValidator {
	using SafeMath for uint256;
	using Decimals for uint256;
	event PropertyTransfer(address _property, address _from, address _to);

	/**
	 * Initialize the passed address as AddressConfig address.
	 */
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	/**
	 * Withdraws rewards.
	 */
	function withdraw(address _property) external {
		/**
		 * Validates the passed Property address is included the Property address set.
		 */
		addressValidator().validateGroup(_property, config().propertyGroup());

		/**
		 * Gets the withdrawable rewards amount and the latest cumulative sum of the maximum mint amount.
		 */
		(uint256 value, uint256 lastPrice) = _calculateWithdrawableAmount(
			_property,
			msg.sender
		);

		/**
		 * Validates the result is not 0.
		 */
		require(value != 0, "withdraw value is 0");

		/**
		 * Saves the latest cumulative sum of the maximum mint amount.
		 * By subtracting this value when calculating the next rewards, always withdrawal the difference from the previous time.
		 */
		WithdrawStorage withdrawStorage = getStorage();
		withdrawStorage.setLastCumulativeHoldersReward(
			_property,
			msg.sender,
			lastPrice
		);

		/**
		 * Sets the number of unwithdrawn rewards to 0.
		 */
		withdrawStorage.setPendingWithdrawal(_property, msg.sender, 0);

		/**
		 * Updates the withdrawal status to avoid double withdrawal for before DIP4.
		 */
		__updateLegacyWithdrawableAmount(_property, msg.sender);

		/**
		 * Mints the holder reward.
		 */
		ERC20Mintable erc20 = ERC20Mintable(config().token());
		require(erc20.mint(msg.sender, value), "dev mint failed");

		/**
		 * Since the total supply of tokens has changed, updates the latest maximum mint amount.
		 */
		ILockup lockup = ILockup(config().lockup());
		lockup.update();

		/**
		 * Adds the reward amount already withdrawn in the passed Property.
		 */
		withdrawStorage.setRewardsAmount(
			_property,
			withdrawStorage.getRewardsAmount(_property).add(value)
		);
	}

	/**
	 * Updates the change in compensation amount due to the change in the ownership ratio of the passed Property.
	 * When the ownership ratio of Property changes, the reward that the Property holder can withdraw will change.
	 * It is necessary to update the status before and after the ownership ratio changes.
	 */
	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
	) external {
		/**
		 * Validates the sender is Allocator contract.
		 */
		addressValidator().validateAddress(msg.sender, config().allocator());

		WithdrawStorage withdrawStorage = getStorage();

		/**
		 * Gets the cumulative sum of the transfer source's "before transfer" withdrawable reward amount and the cumulative sum of the maximum mint amount.
		 */
		(uint256 amountFrom, uint256 priceFrom) = _calculateAmount(
			_property,
			_from
		);

		/**
		 * Gets the cumulative sum of the transfer destination's "before receive" withdrawable reward amount and the cumulative sum of the maximum mint amount.
		 */
		(uint256 amountTo, uint256 priceTo) = _calculateAmount(_property, _to);

		/**
		 * Updates the last cumulative sum of the maximum mint amount of the transfer source and destination.
		 */
		withdrawStorage.setLastCumulativeHoldersReward(
			_property,
			_from,
			priceFrom
		);
		withdrawStorage.setLastCumulativeHoldersReward(_property, _to, priceTo);

		/**
		 * Gets the unwithdrawn reward amount of the transfer source and destination.
		 */
		uint256 pendFrom = withdrawStorage.getPendingWithdrawal(
			_property,
			_from
		);
		uint256 pendTo = withdrawStorage.getPendingWithdrawal(_property, _to);

		/**
		 * Adds the undrawn reward amount of the transfer source and destination.
		 */
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

		emit PropertyTransfer(_property, _from, _to);
	}

	/**
	 * Returns the reward amount already withdrawn in the passed Property.
	 */
	function getRewardsAmount(address _property)
		external
		view
		returns (uint256)
	{
		return getStorage().getRewardsAmount(_property);
	}

	/**
	 * Passthrough to `Lockup.difference` function.
	 */
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
		return ILockup(config().lockup()).difference(_property, 0);
	}

	/**
	 * Returns the holder reward.
	 */
	function _calculateAmount(address _property, address _user)
		private
		view
		returns (uint256 _amount, uint256 _price)
	{
		WithdrawStorage withdrawStorage = getStorage();

		/**
		 * Gets the latest cumulative sum of the maximum mint amount,
		 * and the difference to the previous withdrawal of holder reward unit price.
		 */
		(, , uint256 _holdersPrice, , ) = difference(
			withdrawStorage,
			_property,
			_user
		);

		/**
		 * Gets the last recorded holders reward.
		 */
		uint256 _last = withdrawStorage.getLastCumulativeHoldersReward(
			_property,
			_user
		);

		/**
		 * Gets the ownership ratio of the passed user and the Property.
		 */
		uint256 balance = ERC20Mintable(_property).balanceOf(_user);

		/**
		 * Multiplied by the number of tokens to the holder reward unit price.
		 */
		uint256 value = _holdersPrice.sub(_last).mul(balance);

		/**
		 * Returns the result after adjusted decimals to 10^18, and the latest cumulative sum of the maximum mint amount.
		 */
		return (value.divBasis().divBasis(), _holdersPrice);
	}

	/**
	 * Returns the total rewards currently available for withdrawal. (For calling from inside the contract)
	 */
	function _calculateWithdrawableAmount(address _property, address _user)
		private
		view
		returns (uint256 _amount, uint256 _price)
	{
		/**
		 * Gets the latest withdrawal reward amount.
		 */
		(uint256 _value, uint256 price) = _calculateAmount(_property, _user);

		/**
		 * If the passed Property has not authenticated, returns always 0.
		 */
		if (
			IMetricsGroup(config().metricsGroup()).hasAssets(_property) == false
		) {
			return (0, price);
		}

		/**
		 * Gets the reward amount of before DIP4.
		 */
		uint256 legacy = __legacyWithdrawableAmount(_property, _user);

		/**
		 * Gets the reward amount in saved without withdrawal and returns the sum of all values.
		 */
		uint256 value = _value
			.add(getStorage().getPendingWithdrawal(_property, _user))
			.add(legacy);
		return (value, price);
	}

	/**
	 * Returns the total rewards currently available for withdrawal. (For calling from external of the contract)
	 */
	function calculateWithdrawableAmount(address _property, address _user)
		external
		view
		returns (uint256)
	{
		(uint256 value, ) = _calculateWithdrawableAmount(_property, _user);
		return value;
	}

	/**
	 * Returns the cumulative sum of the holder rewards of the passed Property.
	 */
	function calculateTotalWithdrawableAmount(address _property)
		external
		view
		returns (uint256)
	{
		(, uint256 _amount, , , ) = ILockup(config().lockup()).difference(
			_property,
			0
		);

		/**
		 * Adjusts decimals to 10^18 and returns the result.
		 */
		return _amount.divBasis().divBasis();
	}

	/**
	 * Returns the reward amount of the calculation model before DIP4.
	 * It can be calculated by subtracting "the last cumulative sum of reward unit price" from
	 * "the current cumulative sum of reward unit price," and multiplying by the balance of the user.
	 */
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
		return value.divBasis();
	}

	/**
	 * Updates and treats the reward of before DIP4 as already received.
	 */
	function __updateLegacyWithdrawableAmount(address _property, address _user)
		private
	{
		WithdrawStorage withdrawStorage = getStorage();
		uint256 price = withdrawStorage.getCumulativePrice(_property);
		withdrawStorage.setLastWithdrawalPrice(_property, _user, price);
	}

	/**
	 * Returns WithdrawStorage instance.
	 */
	function getStorage() private view returns (WithdrawStorage) {
		return WithdrawStorage(config().withdrawStorage());
	}
}
