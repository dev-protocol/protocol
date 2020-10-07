pragma solidity 0.5.17;

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
		 * Validates _value is not 0.
		 */
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
	 */
	function beforeStakesChanged(address _property, address _user) private {
		(uint256 reward, uint256 holders, uint256 interest) = getRewardsPrice();
		setStorageLastStakedInterestPrice(_property, _user, interest);
		setStorageLastStakesChangedCumulativeReward(reward);
		setStorageLastStakesChangedHoldersPrice(holders);
		setStorageLastStakesChangedInterestPrice(interest);
	}

	/**
	 */
	function getRewardsPrice()
		public
		view
		returns (
			uint256 _reward,
			uint256 _holders,
			uint256 _interest
		)
	{
		uint256 lastReward = getStorageLastStakesChangedCumulativeReward();
		uint256 lastHoldersPrice = getStorageLastStakesChangedHoldersPrice();
		uint256 lastInterestPrice = getStorageLastStakesChangedInterestPrice();
		uint256 allStakes = getStorageAllValue();
		(uint256 reward, ) = dry();
		uint256 price = allStakes > 0
			? reward.sub(lastReward).mulBasis().div(allStakes)
			: 0;
		uint256 holdersShare = IPolicy(config().policy()).holdersShare(
			price,
			allStakes
		);
		uint256 holdersPrice = holdersShare.add(lastHoldersPrice);
		uint256 interestPrice = price.sub(holdersShare).add(lastInterestPrice);
		return (reward, holdersPrice, interestPrice);
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
	 * Returns the staker reward as interest.
	 */
	function _calculateInterestAmount(address _property, address _user)
		private
		view
		returns (uint256 _amount, uint256 _interestPrice)
	{
		/**
		 * Get the amount the user is staking for the Property.
		 */
		uint256 lockedUpPerAccount = getStorageValue(_property, _user);

		/**
		 * Gets the cumulative sum of the Property's staker reward when the user staked.
		 */
		uint256 lastInterest = getStorageLastStakedInterestPrice(
			_property,
			_user
		);
		(, , uint256 interest) = getRewardsPrice();

		uint256 result = interest >= lastInterest
			? interest.sub(lastInterest).mul(lockedUpPerAccount).divBasis()
			: 0;
		return (result, interest);
	}

	/**
	 * Returns the total rewards currently available for withdrawal. (For calling from inside the contract)
	 */
	function _calculateWithdrawableInterestAmount(
		address _property,
		address _user
	) private view returns (uint256 _amount, uint256 _interestPrice) {
		/**
		 * If the passed Property has not authenticated, returns always 0.
		 */
		if (
			IMetricsGroup(config().metricsGroup()).hasAssets(_property) == false
		) {
			return (0, 0);
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
		(uint256 amount, uint256 interestPrice) = _calculateInterestAmount(
			_property,
			_user
		);

		/**
		 * Returns the sum of all values.
		 */
		uint256 withdrawableAmount = amount
			.add(pending) // solium-disable-next-line indentation
			.add(legacy);
		return (withdrawableAmount, interestPrice);
	}

	/**
	 * Returns the total rewards currently available for withdrawal. (For calling from external of the contract)
	 */
	function calculateWithdrawableInterestAmount(
		address _property,
		address _user
	) public view returns (uint256) {
		(uint256 amount, ) = _calculateWithdrawableInterestAmount(
			_property,
			_user
		);
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
		(
			uint256 value,
			uint256 interestPrice
		) = _calculateWithdrawableInterestAmount(_property, msg.sender);

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
		setStorageLastStakedInterestPrice(_property, msg.sender, interestPrice);
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
		beforeStakesChanged(_property, _account);
		/**
		 * If added staking:
		 */
		if (_addition) {
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
		(uint256 withdrawableAmount, ) = _calculateWithdrawableInterestAmount(
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
