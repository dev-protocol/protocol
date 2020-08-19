pragma solidity ^0.5.0;

// prettier-ignore
import {ERC20Mintable} from "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Decimals} from "contracts/src/common/libs/Decimals.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {IProperty} from "contracts/src/property/IProperty.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {LockupStorage} from "contracts/src/lockup/LockupStorage.sol";
import {IPolicy} from "contracts/src/policy/IPolicy.sol";
import {IAllocator} from "contracts/src/allocator/IAllocator.sol";
import {ILockup} from "contracts/src/lockup/ILockup.sol";
import {IMetricsGroup} from "contracts/src/metrics/IMetricsGroup.sol";

/**
 * A contract that manages the staking of DEV tokens and calculates rewards.
 * Staking and the following mechanism determines that reward calculation.
 *
 * Variables:
 * -`M`: Maximum mint amount per block determined by Allocator contract
 * -`B`: Number of blocks during staking
 * -`P`: Total number of staking locked up in a Property contract
 * -`S`: Total number of staking locked up in all Property contracts
 * -`U`: Number of staking per account locked up in a Property contract
 *
 * Formula:
 * Staking Rewards = M * B * (P / S) * (U / P)
 *
 * Note:
 * -`M`, `P` and `S` vary from block to block, and the variation cannot be predicted.
 * -`B` is added every time the Ethereum block is created.
 * - Only `U` and `B` are predictable variables.
 * - As `M`, `P` and `S` cannot be observed from a staker, the "cumulative sum" is often used to calculate ratio variation with history.
 * - Reward withdrawal always withdraws the total withdrawable amount.
 *
 * Scenario:
 * - Assume `M` is fixed at 500
 * - Alice stakes 100 DEV on Property-A (Alice's staking state on Property-A: `M`=500, `B`=0, `P`=100, `S`=100, `U`=100)
 * - After 10 blocks, Bob stakes 60 DEV on Property-B (Alice's staking state on Property-A: `M`=500, `B`=10, `P`=100, `S`=160, `U`=100)
 * - After 10 blocks, Carol stakes 40 DEV on Property-A (Alice's staking state on Property-A: `M`=500, `B`=20, `P`=140, `S`=200, `U`=100)
 * - After 10 blocks, Alice withdraws Property-A staking reward. The reward at this time is 5000 DEV (10 blocks * 500 DEV) + 3125 DEV (10 blocks * 62.5% * 500 DEV) + 2500 DEV (10 blocks * 50% * 500 DEV).
 */
contract Lockup is ILockup, UsingConfig, UsingValidator, LockupStorage {
	using SafeMath for uint256;
	using Decimals for uint256;
	event Lockedup(address _from, address _property, uint256 _value);

	/**
	 * Initialize the passed address as AddressConfig address.
	 */
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	/**
	 * Adds staking.
	 * Only the Dev contract can execute this function.
	 */
	function lockup(
		address _from,
		address _property,
		uint256 _value
	) external {
		/**
		 * Validates the sender is Dev contract.
		 */
		addressValidator().validateAddress(msg.sender, config().token());

		/**
		 * Validates the target of staking is included Property set.
		 */
		addressValidator().validateGroup(_property, config().propertyGroup());
		require(_value != 0, "illegal lockup value");

		/**
		 * Validates the passed Property has greater than 1 asset.
		 */
		require(
			IMetricsGroup(config().metricsGroup()).hasAssets(_property),
			"unable to stake to unauthenticated property"
		);

		/**
		 * Refuses new staking when after cancel staking and until release it.
		 */
		bool isWaiting = getStorageWithdrawalStatus(_property, _from) != 0;
		require(isWaiting == false, "lockup is already canceled");

		/**
		 * Since the reward per block that can be withdrawn will change with the addition of staking,
		 * saves the undrawn withdrawable reward before addition it.
		 */
		updatePendingInterestWithdrawal(_property, _from);

		/**
		 * Saves the variables at the time of staking to prepare for reward calculation.
		 */
		(, , , uint256 interest, ) = difference(_property, 0);
		updateStatesAtLockup(_property, _from, interest);

		/**
		 * Saves variables that should change due to the addition of staking.
		 */
		updateValues(true, _from, _property, _value);
		emit Lockedup(_from, _property, _value);
	}

	/**
	 * Cancel staking.
	 * The staking amount can be withdrawn after the blocks specified by `Policy.lockUpBlocks` have passed.
	 */
	function cancel(address _property) external {
		/**
		 * Validates the target of staked is included Property set.
		 */
		addressValidator().validateGroup(_property, config().propertyGroup());

		/**
		 * Validates the sender is staking to the target Property.
		 */
		require(hasValue(_property, msg.sender), "dev token is not locked");

		/**
		 * Validates not already been canceled.
		 */
		bool isWaiting = getStorageWithdrawalStatus(_property, msg.sender) != 0;
		require(isWaiting == false, "lockup is already canceled");

		/**
		 * Get `Policy.lockUpBlocks`, add it to the current block number, and saves that block number in `WithdrawalStatus`.
		 * Staking is cannot release until the block number saved in `WithdrawalStatus` is reached.
		 */
		uint256 blockNumber = IPolicy(config().policy()).lockUpBlocks();
		blockNumber = blockNumber.add(block.number);
		setStorageWithdrawalStatus(_property, msg.sender, blockNumber);
	}

	/**
	 * Withdraw staking.
	 * Releases canceled staking and transfer the staked amount to the sender.
	 */
	function withdraw(address _property) external {
		/**
		 * Validates the target of staked is included Property set.
		 */
		addressValidator().validateGroup(_property, config().propertyGroup());

		/**
		 * Validates the block number reaches the block number where staking can be released.
		 */
		require(possible(_property, msg.sender), "waiting for release");

		/**
		 * Validates the sender is staking to the target Property.
		 */
		uint256 lockedUpValue = getStorageValue(_property, msg.sender);
		require(lockedUpValue != 0, "dev token is not locked");

		/**
		 * Since the increase of rewards will stop with the release of the staking,
		 * saves the undrawn withdrawable reward before releasing it.
		 */
		updatePendingInterestWithdrawal(_property, msg.sender);

		/**
		 * Transfer the staked amount to the sender.
		 */
		IProperty(_property).withdraw(msg.sender, lockedUpValue);

		/**
		 * Saves variables that should change due to the canceling staking..
		 */
		updateValues(false, msg.sender, _property, lockedUpValue);

		/**
		 * Sets the staked amount to 0.
		 */
		setStorageValue(_property, msg.sender, 0);

		/**
		 * Sets the cancellation status to not have.
		 */
		setStorageWithdrawalStatus(_property, msg.sender, 0);
	}

	/**
	 * Returns the current staking amount, and the block number in which the recorded last.
	 * These values are used to calculate the cumulative sum of the staking.
	 */
	function getCumulativeLockedUpUnitAndBlock(address _property)
		private
		view
		returns (uint256 _unit, uint256 _block)
	{
		/**
		 * Get the current staking amount and the last recorded block number from the `CumulativeLockedUpUnitAndBlock` storage.
		 * If the last recorded block number is not 0, it is returns as it is.
		 */
		(
			uint256 unit,
			uint256 lastBlock
		) = getStorageCumulativeLockedUpUnitAndBlock(_property);
		if (lastBlock > 0) {
			return (unit, lastBlock);
		}

		/**
		 * If the last recorded block number is 0, this function falls back as already staked before the current specs (before DIP4).
		 * More detail for DIP4: https://github.com/dev-protocol/DIPs/issues/4
		 *
		 * When the passed address is 0, the caller wants to know the total staking amount on the protocol,
		 * so gets the total staking amount from `AllValue` storage.
		 * When the address is other than 0, the caller wants to know the staking amount of a Property,
		 * so gets the staking amount from the `PropertyValue` storage.
		 */
		unit = _property == address(0)
			? getStorageAllValue()
			: getStoragePropertyValue(_property);

		/**
		 * Staking pre-DIP4 will be treated as staked simultaneously with the DIP4 release.
		 * Therefore, the last recorded block number is the same as the DIP4 release block.
		 */
		lastBlock = getStorageDIP4GenesisBlock();
		return (unit, lastBlock);
	}

	/**
	 * Returns the cumulative sum of the staking on passed address, the current staking amount,
	 * and the block number in which the recorded last.
	 * The latest cumulative sum can be calculated using the following formula:
	 * (current staking amount) * (current block number - last recorded block number) + (last cumulative sum)
	 */
	function getCumulativeLockedUp(address _property)
		public
		view
		returns (
			uint256 _value,
			uint256 _unit,
			uint256 _block
		)
	{
		/**
		 * Gets the current staking amount and the last recorded block number from the `getCumulativeLockedUpUnitAndBlock` function.
		 */
		(uint256 unit, uint256 lastBlock) = getCumulativeLockedUpUnitAndBlock(
			_property
		);

		/**
		 * Gets the last cumulative sum of the staking from `CumulativeLockedUpValue` storage.
		 */
		uint256 lastValue = getStorageCumulativeLockedUpValue(_property);

		/**
		 * Returns the latest cumulative sum, current staking amount as a unit, and last recorded block number.
		 */
		return (
			lastValue.add(unit.mul(block.number.sub(lastBlock))),
			unit,
			lastBlock
		);
	}

	/**
	 * Returns the cumulative sum of the staking on the protocol totally, the current staking amount,
	 * and the block number in which the recorded last.
	 */
	function getCumulativeLockedUpAll()
		public
		view
		returns (
			uint256 _value,
			uint256 _unit,
			uint256 _block
		)
	{
		/**
		 * If the 0 address is passed as a key, it indicates the entire protocol.
		 */
		return getCumulativeLockedUp(address(0));
	}

	/**
	 * Updates the `CumulativeLockedUpValue` and `CumulativeLockedUpUnitAndBlock` storage.
	 * This function expected to executes when the amount of staking as a unit changes.
	 */
	function updateCumulativeLockedUp(
		bool _addition,
		address _property,
		uint256 _unit
	) private {
		address zero = address(0);

		/**
		 * Gets the cumulative sum of the staking amount, staking amount, and last recorded block number for the passed Property address.
		 */
		(uint256 lastValue, uint256 lastUnit, ) = getCumulativeLockedUp(
			_property
		);

		/**
		 * Gets the cumulative sum of the staking amount, staking amount, and last recorded block number for the protocol total.
		 */
		(uint256 lastValueAll, uint256 lastUnitAll, ) = getCumulativeLockedUp(
			zero
		);

		/**
		 * Adds or subtracts the staking amount as a new unit to the cumulative sum of the staking for the passed Property address.
		 */
		setStorageCumulativeLockedUpValue(
			_property,
			_addition ? lastValue.add(_unit) : lastValue.sub(_unit)
		);

		/**
		 * Adds or subtracts the staking amount as a new unit to the cumulative sum of the staking for the protocol total.
		 */
		setStorageCumulativeLockedUpValue(
			zero,
			_addition ? lastValueAll.add(_unit) : lastValueAll.sub(_unit)
		);

		/**
		 * Adds or subtracts the staking amount to the staking unit for the passed Property address.
		 * Also, record the latest block number.
		 */
		setStorageCumulativeLockedUpUnitAndBlock(
			_property,
			_addition ? lastUnit.add(_unit) : lastUnit.sub(_unit),
			block.number
		);

		/**
		 * Adds or subtracts the staking amount to the staking unit for the protocol total.
		 * Also, record the latest block number.
		 */
		setStorageCumulativeLockedUpUnitAndBlock(
			zero,
			_addition ? lastUnitAll.add(_unit) : lastUnitAll.sub(_unit),
			block.number
		);
	}

	/**
	 * Updates cumulative sum of the maximum mint amount calculated by Allocator contract, the latest maximum mint amount per block,
	 * and the last recorded block number.
	 * The cumulative sum of the maximum mint amount is always added.
	 * By recording that value when the staker last stakes, the difference from the when the staker stakes can be calculated.
	 */
	function update() public {
		/**
		 * Gets the cumulative sum of the maximum mint amount and the maximum mint number per block.
		 */
		(uint256 _nextRewards, uint256 _amount) = dry();

		/**
		 * Records each value and the latest block number.
		 */
		setStorageCumulativeGlobalRewards(_nextRewards);
		setStorageLastSameRewardsAmountAndBlock(_amount, block.number);
	}

	/**
	 * Updates the cumulative sum of the maximum mint amount when staking, the cumulative sum of staker reward as an interest of the target Property
	 * and the cumulative staking amount, and the latest block number.
	 */
	function updateStatesAtLockup(
		address _property,
		address _user,
		uint256 _interest
	) private {
		/**
		 * Gets the cumulative sum of the maximum mint amount.
		 */
		(uint256 _reward, ) = dry();

		/**
		 * Records each value and the latest block number.
		 */
		if (isSingle(_property, _user)) {
			setStorageLastCumulativeGlobalReward(_property, _user, _reward);
		}
		setStorageLastCumulativePropertyInterest(_property, _user, _interest);
		(uint256 cLocked, , ) = getCumulativeLockedUp(_property);
		setStorageLastCumulativeLockedUpAndBlock(
			_property,
			_user,
			cLocked,
			block.number
		);
	}

	/**
	 * Returns the last cumulative staking amount of the passed Property address and the last recorded block number.
	 */
	function getLastCumulativeLockedUpAndBlock(address _property, address _user)
		private
		view
		returns (uint256 _cLocked, uint256 _block)
	{
		/**
		 * Gets the values from `LastCumulativeLockedUpAndBlock` storage.
		 */
		(
			uint256 cLocked,
			uint256 blockNumber
		) = getStorageLastCumulativeLockedUpAndBlock(_property, _user);

		/**
		 * When the last recorded block number is 0, the block number at the time of the DIP4 release is returned as being staked at the same time as the DIP4 release.
		 * More detail for DIP4: https://github.com/dev-protocol/DIPs/issues/4
		 */
		if (blockNumber == 0) {
			blockNumber = getStorageDIP4GenesisBlock();
		}
		return (cLocked, blockNumber);
	}

	/**
	 * Referring to the values recorded in each storage to returns the latest cumulative sum of the maximum mint amount and the latest maximum mint amount per block.
	 */
	function dry()
		private
		view
		returns (uint256 _nextRewards, uint256 _amount)
	{
		/**
		 * Gets the latest mint amount per block from Allocator contract.
		 */
		uint256 rewardsAmount = IAllocator(config().allocator())
			.calculateMaxRewardsPerBlock();

		/**
		 * Gets the maximum mint amount per block, and the last recorded block number from `LastSameRewardsAmountAndBlock` storage.
		 */
		(
			uint256 lastAmount,
			uint256 lastBlock
		) = getStorageLastSameRewardsAmountAndBlock();

		/**
		 * If the recorded maximum mint amount per block and the result of the Allocator contract are different,
		 * the result of the Allocator contract takes precedence as a maximum mint amount per block.
		 */
		uint256 lastMaxRewards = lastAmount == rewardsAmount
			? rewardsAmount
			: lastAmount;

		/**
		 * Calculates the difference between the latest block number and the last recorded block number.
		 */
		uint256 blocks = lastBlock > 0 ? block.number.sub(lastBlock) : 0;

		/**
		 * Adds the calculated new cumulative maximum mint amount to the recorded cumulative maximum mint amount.
		 */
		uint256 additionalRewards = lastMaxRewards.mul(blocks);
		uint256 nextRewards = getStorageCumulativeGlobalRewards().add(
			additionalRewards
		);

		/**
		 * Returns the latest theoretical cumulative sum of maximum mint amount and maximum mint amount per block.
		 */
		return (nextRewards, rewardsAmount);
	}

	/**
	 * Returns the latest theoretical cumulative sum of maximum mint amount, the holder's reward of the passed Property address and its unit price,
	 * and the staker's reward as interest and its unit price.
	 * The latest theoretical cumulative sum of maximum mint amount is got from `dry` function.
	 * The Holder's reward is a staking(delegation) reward received by the holder of the Property contract(token) according to the share.
	 * The unit price of the holder's reward is the reward obtained per 1 piece of Property contract(token).
	 * The staker rewards are rewards for staking users.
	 * The unit price of the staker reward is the reward per DEV token 1 piece that is staking.
	 */
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
		/**
		 * Gets the cumulative sum of the maximum mint amount.
		 */
		(uint256 rewards, ) = dry();

		/**
		 * Gets the cumulative sum of the staking amount of the passed Property address and
		 * the cumulative sum of the staking amount of the protocol total.
		 */
		(uint256 valuePerProperty, , ) = getCumulativeLockedUp(_property);
		(uint256 valueAll, , ) = getCumulativeLockedUpAll();

		/**
		 * Calculates the amount of reward that can be received by the Property from the ratio of the cumulative sum of the staking amount of the Property address
		 * and the cumulative sum of the staking amount of the protocol total.
		 * If the past cumulative sum of the maximum mint amount passed as the second argument is 1 or more,
		 * this result is the difference from that cumulative sum.
		 */
		uint256 propertyRewards = rewards.sub(_lastReward).mul(
			valuePerProperty.mulBasis().outOf(valueAll)
		);

		/**
		 * Gets the staking amount and total supply of the Property and calls `Policy.holdersShare` function to calculates
		 * the holder's reward amount out of the total reward amount.
		 */
		uint256 lockedUpPerProperty = getStoragePropertyValue(_property);
		uint256 totalSupply = ERC20Mintable(_property).totalSupply();
		uint256 holders = IPolicy(config().policy()).holdersShare(
			propertyRewards,
			lockedUpPerProperty
		);

		/**
		 * The total rewards amount minus the holder reward amount is the staker rewards as an interest.
		 */
		uint256 interest = propertyRewards.sub(holders);

		/**
		 * Returns each value and a unit price of each reward.
		 */
		return (
			rewards,
			holders,
			holders.div(totalSupply),
			interest,
			lockedUpPerProperty > 0 ? interest.div(lockedUpPerProperty) : 0
		);
	}

	/**
	 * Returns the staker reward as interest.
	 */
	function _calculateInterestAmount(address _property, address _user)
		private
		view
		returns (uint256)
	{
		/**
		 * Gets the cumulative sum of the staking amount, current staking amount, and last recorded block number of the Property.
		 */
		(
			uint256 cLockProperty,
			uint256 unit,
			uint256 lastBlock
		) = getCumulativeLockedUp(_property);

		/**
		 * Gets the cumulative sum of staking amount and block number of Property when the user staked.
		 */
		(
			uint256 lastCLocked,
			uint256 lastBlockUser
		) = getLastCumulativeLockedUpAndBlock(_property, _user);

		/**
		 * Get the amount the user is staking for the Property.
		 */
		uint256 lockedUpPerAccount = getStorageValue(_property, _user);

		/**
		 * Gets the cumulative sum of the Property's staker reward when the user staked.
		 */
		uint256 lastInterest = getStorageLastCumulativePropertyInterest(
			_property,
			_user
		);

		/**
		 * Calculates the cumulative sum of the staking amount from the time the user staked to the present.
		 * It can be calculated by multiplying the staking amount by the number of elapsed blocks.
		 */
		uint256 cLockUser = lockedUpPerAccount.mul(
			block.number.sub(lastBlockUser)
		);

		/**
		 * Determines if the user is the only staker to the Property.
		 */
		bool isOnly = unit == lockedUpPerAccount && lastBlock <= lastBlockUser;

		/**
		 * If the user is the Property's only staker and the first staker, and the only staker on the protocol:
		 */
		if (isSingle(_property, _user)) {
			/**
			 * Passing the cumulative sum of the maximum mint amount when staked, to the `difference` function,
			 * gets the staker reward amount that the user can receive from the time of staking to the present.
			 * In the case of the staking is single, the ratio of the Property and the user account for 100% of the cumulative sum of the maximum mint amount,
			 * so the difference cannot be calculated with the value of `LastCumulativePropertyInterest`.
			 * Therefore, it is necessary to calculate the difference using the cumulative sum of the maximum mint amounts at the time of staked.
			 */
			(, , , , uint256 interestPrice) = difference(
				_property,
				getStorageLastCumulativeGlobalReward(_property, _user)
			);

			/**
			 * Returns the result after adjusted decimals to 10^18.
			 */
			uint256 result = interestPrice
				.mul(lockedUpPerAccount)
				.divBasis()
				.divBasis();
			return result;

			/**
			 * If not the single but the only staker:
			 */
		} else if (isOnly) {
			/**
			 * Pass 0 to the `difference` function to gets the Property's cumulative sum of the staker reward.
			 */
			(, , , uint256 interest, ) = difference(_property, 0);

			/**
			 * Calculates the difference in rewards that can be received by subtracting the Property's cumulative sum of staker rewards at the time of staking.
			 */
			uint256 result = interest.sub(lastInterest).divBasis().divBasis();
			return result;
		}

		/**
		 * If the user is the Property's not the first staker and not the only staker:
		 */

		/**
		 * Pass 0 to the `difference` function to gets the Property's cumulative sum of the staker reward.
		 */
		(, , , uint256 interest, ) = difference(_property, 0);

		/**
		 * Calculates the share of rewards that can be received by the user among Property's staker rewards.
		 * "Cumulative sum of the staking amount of the Property at the time of staking" is subtracted from "cumulative sum of the staking amount of the Property",
		 * and calculates the cumulative sum of staking amounts from the time of staking to the present.
		 * The ratio of the "cumulative sum of staking amount from the time the user staked to the present" to that value is the share.
		 */
		uint256 share = cLockUser.outOf(cLockProperty.sub(lastCLocked));

		/**
		 * If the Property's staker reward is greater than the value of the `CumulativePropertyInterest` storage,
		 * calculates the difference and multiply by the share.
		 * Otherwise, it returns 0.
		 */
		uint256 result = interest >= lastInterest
			? interest
				.sub(lastInterest)
				.mul(share)
				.divBasis()
				.divBasis()
				.divBasis()
			: 0;
		return result;
	}

	/**
	 * Returns the total rewards currently available for withdrawal. (For calling from inside the contract)
	 */
	function _calculateWithdrawableInterestAmount(
		address _property,
		address _user
	) private view returns (uint256) {
		/**
		 * If the passed Property has not authenticated, returns always 0.
		 */
		if (
			IMetricsGroup(config().metricsGroup()).hasAssets(_property) == false
		) {
			return 0;
		}

		/**
		 * Gets the reward amount in saved without withdrawal.
		 */
		uint256 pending = getStoragePendingInterestWithdrawal(_property, _user);

		/**
		 * Gets the reward amount of before DIP4.
		 */
		uint256 legacy = __legacyWithdrawableInterestAmount(_property, _user);

		/**
		 * Gets the latest withdrawal reward amount.
		 */
		uint256 amount = _calculateInterestAmount(_property, _user);

		/**
		 * Returns the sum of all values.
		 */
		uint256 withdrawableAmount = amount
			.add(pending) // solium-disable-next-line indentation
			.add(legacy);
		return withdrawableAmount;
	}

	/**
	 * Returns the total rewards currently available for withdrawal. (For calling from external of the contract)
	 */
	function calculateWithdrawableInterestAmount(
		address _property,
		address _user
	) public view returns (uint256) {
		uint256 amount = _calculateWithdrawableInterestAmount(_property, _user);
		return amount;
	}

	/**
	 * Withdraws staking reward as an interest.
	 */
	function withdrawInterest(address _property) external {
		/**
		 * Validates the target of staking is included Property set.
		 */
		addressValidator().validateGroup(_property, config().propertyGroup());

		/**
		 * Gets the withdrawable amount.
		 */
		uint256 value = _calculateWithdrawableInterestAmount(
			_property,
			msg.sender
		);

		/**
		 * Gets the cumulative sum of staker rewards of the passed Property address.
		 */
		(, , , uint256 interest, ) = difference(_property, 0);

		/**
		 * Validates rewards amount there are 1 or more.
		 */
		require(value > 0, "your interest amount is 0");

		/**
		 * Sets the unwithdrawn reward amount to 0.
		 */
		setStoragePendingInterestWithdrawal(_property, msg.sender, 0);

		/**
		 * Creates a Dev token instance.
		 */
		ERC20Mintable erc20 = ERC20Mintable(config().token());

		/**
		 * Updates the staking status to avoid double rewards.
		 */
		updateStatesAtLockup(_property, msg.sender, interest);
		__updateLegacyWithdrawableInterestAmount(_property, msg.sender);

		/**
		 * Mints the reward.
		 */
		require(erc20.mint(msg.sender, value), "dev mint failed");

		/**
		 * Since the total supply of tokens has changed, updates the latest maximum mint amount.
		 */
		update();
	}

	/**
	 * Status updates with the addition or release of staking.
	 */
	function updateValues(
		bool _addition,
		address _account,
		address _property,
		uint256 _value
	) private {
		/**
		 * If added staking:
		 */
		if (_addition) {
			/**
			 * Updates the cumulative sum of the staking amount of the passed Property and the cumulative amount of the staking amount of the protocol total.
			 */
			updateCumulativeLockedUp(true, _property, _value);

			/**
			 * Updates the current staking amount of the protocol total.
			 */
			addAllValue(_value);

			/**
			 * Updates the current staking amount of the Property.
			 */
			addPropertyValue(_property, _value);

			/**
			 * Updates the user's current staking amount in the Property.
			 */
			addValue(_property, _account, _value);

			/**
			 * If released staking:
			 */
		} else {
			/**
			 * Updates the cumulative sum of the staking amount of the passed Property and the cumulative amount of the staking amount of the protocol total.
			 */
			updateCumulativeLockedUp(false, _property, _value);

			/**
			 * Updates the current staking amount of the protocol total.
			 */
			subAllValue(_value);

			/**
			 * Updates the current staking amount of the Property.
			 */
			subPropertyValue(_property, _value);
		}

		/**
		 * Since each staking amount has changed, updates the latest maximum mint amount.
		 */
		update();
	}

	/**
	 * Returns the staking amount of the protocol total.
	 */
	function getAllValue() external view returns (uint256) {
		return getStorageAllValue();
	}

	/**
	 * Adds the staking amount of the protocol total.
	 */
	function addAllValue(uint256 _value) private {
		uint256 value = getStorageAllValue();
		value = value.add(_value);
		setStorageAllValue(value);
	}

	/**
	 * Subtracts the staking amount of the protocol total.
	 */
	function subAllValue(uint256 _value) private {
		uint256 value = getStorageAllValue();
		value = value.sub(_value);
		setStorageAllValue(value);
	}

	/**
	 * Returns the user's staking amount in the Property.
	 */
	function getValue(address _property, address _sender)
		external
		view
		returns (uint256)
	{
		return getStorageValue(_property, _sender);
	}

	/**
	 * Adds the user's staking amount in the Property.
	 */
	function addValue(
		address _property,
		address _sender,
		uint256 _value
	) private {
		uint256 value = getStorageValue(_property, _sender);
		value = value.add(_value);
		setStorageValue(_property, _sender, value);
	}

	/**
	 * Returns whether the user is staking in the Property.
	 */
	function hasValue(address _property, address _sender)
		private
		view
		returns (bool)
	{
		uint256 value = getStorageValue(_property, _sender);
		return value != 0;
	}

	/**
	 * Returns whether a single user has all staking share.
	 * This value is true when only one Property and one user is historically the only staker.
	 */
	function isSingle(address _property, address _user)
		private
		view
		returns (bool)
	{
		uint256 perAccount = getStorageValue(_property, _user);
		(uint256 cLockProperty, uint256 unitProperty, ) = getCumulativeLockedUp(
			_property
		);
		(uint256 cLockTotal, , ) = getCumulativeLockedUpAll();
		return perAccount == unitProperty && cLockProperty == cLockTotal;
	}

	/**
	 * Returns the staking amount of the Property.
	 */
	function getPropertyValue(address _property)
		external
		view
		returns (uint256)
	{
		return getStoragePropertyValue(_property);
	}

	/**
	 * Adds the staking amount of the Property.
	 */
	function addPropertyValue(address _property, uint256 _value) private {
		uint256 value = getStoragePropertyValue(_property);
		value = value.add(_value);
		setStoragePropertyValue(_property, value);
	}

	/**
	 * Subtracts the staking amount of the Property.
	 */
	function subPropertyValue(address _property, uint256 _value) private {
		uint256 value = getStoragePropertyValue(_property);
		uint256 nextValue = value.sub(_value);
		setStoragePropertyValue(_property, nextValue);
	}

	/**
	 * Saves the latest reward amount as an undrawn amount.
	 */
	function updatePendingInterestWithdrawal(address _property, address _user)
		private
	{
		/**
		 * Gets the latest reward amount.
		 */
		uint256 withdrawableAmount = _calculateWithdrawableInterestAmount(
			_property,
			_user
		);

		/**
		 * Saves the amount to `PendingInterestWithdrawal` storage.
		 */
		setStoragePendingInterestWithdrawal(
			_property,
			_user,
			withdrawableAmount
		);

		/**
		 * Updates the reward amount of before DIP4 to prevent further addition it.
		 */
		__updateLegacyWithdrawableInterestAmount(_property, _user);
	}

	/**
	 * Returns whether the staking can be released.
	 */
	function possible(address _property, address _from)
		private
		view
		returns (bool)
	{
		uint256 blockNumber = getStorageWithdrawalStatus(_property, _from);
		if (blockNumber == 0) {
			return false;
		}
		if (blockNumber <= block.number) {
			return true;
		} else {
			if (IPolicy(config().policy()).lockUpBlocks() == 1) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Returns the reward amount of the calculation model before DIP4.
	 * It can be calculated by subtracting "the last cumulative sum of reward unit price" from
	 * "the current cumulative sum of reward unit price," and multiplying by the staking amount.
	 */
	function __legacyWithdrawableInterestAmount(
		address _property,
		address _user
	) private view returns (uint256) {
		uint256 _last = getStorageLastInterestPrice(_property, _user);
		uint256 price = getStorageInterestPrice(_property);
		uint256 priceGap = price.sub(_last);
		uint256 lockedUpValue = getStorageValue(_property, _user);
		uint256 value = priceGap.mul(lockedUpValue);
		return value.divBasis();
	}

	/**
	 * Updates and treats the reward of before DIP4 as already received.
	 */
	function __updateLegacyWithdrawableInterestAmount(
		address _property,
		address _user
	) private {
		uint256 interestPrice = getStorageInterestPrice(_property);
		if (getStorageLastInterestPrice(_property, _user) != interestPrice) {
			setStorageLastInterestPrice(_property, _user, interestPrice);
		}
	}

	/**
	 * Updates the block number of the time of DIP4 release.
	 */
	function setDIP4GenesisBlock(uint256 _block) external onlyOwner {
		/**
		 * Validates the value is not set.
		 */
		require(getStorageDIP4GenesisBlock() == 0, "already set the value");

		/**
		 * Sets the value.
		 */
		setStorageDIP4GenesisBlock(_block);
	}
}
