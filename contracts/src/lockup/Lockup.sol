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
	uint256 private one = 1;
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
		setStorageCumulativeLockedUpValue(
			_property,
			_addition ? lastValue.add(_unit) : lastValue.sub(_unit)
		);
		setStorageCumulativeLockedUpValue(
			zero,
			_addition ? lastValueAll.add(_unit) : lastValueAll.sub(_unit)
		);
		setStorageCumulativeLockedUpUnitAndBlock(
			_property,
			_addition ? lastUnit.add(_unit) : lastUnit.sub(_unit),
			block.number
		);
		setStorageCumulativeLockedUpUnitAndBlock(
			zero,
			_addition ? lastUnitAll.add(_unit) : lastUnitAll.sub(_unit),
			block.number
		);
	}

	function update() public {
		(uint256 _nextRewards, uint256 _amount) = dry();
		setStorageCumulativeGlobalRewards(_nextRewards);
		setStorageLastSameRewardsAmountAndBlock(_amount, block.number);
	}

	function updateStatesAtLockup(
		address _property,
		address _user,
		uint256 _interest
	) private {
		(uint256 _reward, ) = dry();
		setStorageLastCumulativeGlobalReward(_property, _user, _reward);
		setStorageLastCumulativePropertyInterest(_property, _user, _interest);
		(uint256 cLocked, , ) = getCumulativeLockedUp(_property);
		setStorageLastCumulativeLockedUpAndBlock(
			_property,
			_user,
			cLocked,
			block.number
		);
	}

	function getLastCumulativeLockedUpAndBlock(address _property, address _user)
		private
		view
		returns (uint256 _cLocked, uint256 _block)
	{
		(
			uint256 cLocked,
			uint256 blockNumber
		) = getStorageLastCumulativeLockedUpAndBlock(_property, _user);
		if (blockNumber == 0) {
			// Fallback when locked-ups that before DIP4.
			// The number of last cumulative locked-ups is 0, the block number of the last locked-up is start block of DIP4.
			blockNumber = getStorageDIP4GenesisBlock();
		}
		return (cLocked, blockNumber);
	}

	function dry()
		private
		view
		returns (uint256 _nextRewards, uint256 _amount)
	{
		uint256 rewardsAmount = IAllocator(config().allocator())
			.calculateMaxRewardsPerBlock();
		(
			uint256 lastAmount,
			uint256 lastBlock
		) = getStorageLastSameRewardsAmountAndBlock();
		uint256 lastMaxRewards = lastAmount == rewardsAmount
			? rewardsAmount
			: lastAmount;

		uint256 blocks = lastBlock > 0 ? block.number.sub(lastBlock) : 0;
		uint256 additionalRewards = lastMaxRewards.mul(blocks);
		uint256 nextRewards = getStorageCumulativeGlobalRewards().add(
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
		(uint256 rewards, ) = dry();
		(uint256 valuePerProperty, , ) = getCumulativeLockedUp(_property);
		(uint256 valueAll, , ) = getCumulativeLockedUpAll();
		uint256 propertyRewards = rewards.sub(_lastReward).mul(
			valuePerProperty.mulBasis().outOf(valueAll)
		);
		uint256 lockedUpPerProperty = getStoragePropertyValue(_property);
		uint256 totalSupply = ERC20Mintable(_property).totalSupply();
		uint256 holders = IPolicy(config().policy()).holdersShare(
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

	function _calculateInterestAmount(address _property, address _user)
		private
		view
		returns (uint256)
	{
		(
			uint256 cLockProperty,
			uint256 unit,
			uint256 lastBlock
		) = getCumulativeLockedUp(_property);
		(
			uint256 lastCLocked,
			uint256 lastBlockUser
		) = getLastCumulativeLockedUpAndBlock(_property, _user);
		uint256 lockedUpPerAccount = getStorageValue(_property, _user);
		uint256 lastInterest = getStorageLastCumulativePropertyInterest(
			_property,
			_user
		);
		uint256 cLockUser = lockedUpPerAccount.mul(
			block.number.sub(lastBlockUser)
		);
		bool isOnly = unit == lockedUpPerAccount && lastBlock <= lastBlockUser;
		if (lastInterest == 0 && isOnly) {
			(, , , uint256 interest, ) = difference(
				_property,
				getStorageLastCumulativeGlobalReward(_property, _user)
			);
			uint256 result = interest.divBasis().divBasis();
			return result;
		} else if (isOnly) {
			(, , , uint256 interest, ) = difference(_property, 0);
			uint256 result = interest.sub(lastInterest).divBasis().divBasis();
			return result;
		}
		(, , , uint256 interest, ) = difference(_property, 0);
		uint256 share = cLockUser.outOf(cLockProperty.sub(lastCLocked));
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

	function _calculateWithdrawableInterestAmount(
		address _property,
		address _user
	) private view returns (uint256) {
		uint256 pending = getStoragePendingInterestWithdrawal(_property, _user);
		uint256 legacy = __legacyWithdrawableInterestAmount(_property, _user);
		uint256 amount = _calculateInterestAmount(_property, _user);
		uint256 withdrawableAmount = amount
			.add(pending) // solium-disable-next-line indentation
			.add(legacy);
		return withdrawableAmount;
	}

	function calculateWithdrawableInterestAmount(
		address _property,
		address _user
	) public view returns (uint256) {
		uint256 amount = _calculateWithdrawableInterestAmount(_property, _user);
		return amount;
	}

	function withdrawInterest(address _property) external {
		addressValidator().validateGroup(_property, config().propertyGroup());

		uint256 value = _calculateWithdrawableInterestAmount(
			_property,
			msg.sender
		);
		(, , , uint256 interest, ) = difference(_property, 0);
		require(value > 0, "your interest amount is 0");
		setStoragePendingInterestWithdrawal(_property, msg.sender, 0);
		ERC20Mintable erc20 = ERC20Mintable(config().token());
		updateStatesAtLockup(_property, msg.sender, interest);
		__updateLegacyWithdrawableInterestAmount(_property, msg.sender);
		require(erc20.mint(msg.sender, value), "dev mint failed");
		update();
	}

	function updateValues(
		bool _addition,
		address _account,
		address _property,
		uint256 _value
	) private {
		if (_addition) {
			updateCumulativeLockedUp(true, _property, _value);
			addAllValue(_value);
			addPropertyValue(_property, _value);
			addValue(_property, _account, _value);
		} else {
			updateCumulativeLockedUp(false, _property, _value);
			subAllValue(_value);
			subPropertyValue(_property, _value);
		}
		update();
	}

	function getAllValue() external view returns (uint256) {
		return getStorageAllValue();
	}

	function addAllValue(uint256 _value) private {
		uint256 value = getStorageAllValue();
		value = value.add(_value);
		setStorageAllValue(value);
	}

	function subAllValue(uint256 _value) private {
		uint256 value = getStorageAllValue();
		value = value.sub(_value);
		setStorageAllValue(value);
	}

	function getValue(address _property, address _sender)
		external
		view
		returns (uint256)
	{
		return getStorageValue(_property, _sender);
	}

	function addValue(
		address _property,
		address _sender,
		uint256 _value
	) private {
		uint256 value = getStorageValue(_property, _sender);
		value = value.add(_value);
		setStorageValue(_property, _sender, value);
	}

	function hasValue(address _property, address _sender)
		private
		view
		returns (bool)
	{
		uint256 value = getStorageValue(_property, _sender);
		return value != 0;
	}

	function getPropertyValue(address _property)
		external
		view
		returns (uint256)
	{
		return getStoragePropertyValue(_property);
	}

	function addPropertyValue(address _property, uint256 _value) private {
		uint256 value = getStoragePropertyValue(_property);
		value = value.add(_value);
		setStoragePropertyValue(_property, value);
	}

	function subPropertyValue(address _property, uint256 _value) private {
		uint256 value = getStoragePropertyValue(_property);
		uint256 nextValue = value.sub(_value);
		setStoragePropertyValue(_property, nextValue);
	}

	function updatePendingInterestWithdrawal(address _property, address _user)
		private
	{
		uint256 withdrawableAmount = _calculateWithdrawableInterestAmount(
			_property,
			_user
		);
		setStoragePendingInterestWithdrawal(
			_property,
			_user,
			withdrawableAmount
		);
		__updateLegacyWithdrawableInterestAmount(_property, _user);
	}

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

	function __updateLegacyWithdrawableInterestAmount(
		address _property,
		address _user
	) private {
		uint256 interestPrice = getStorageInterestPrice(_property);
		if (getStorageLastInterestPrice(_property, _user) != interestPrice) {
			setStorageLastInterestPrice(_property, _user, interestPrice);
		}
	}

	function setDIP4GenesisBlock(uint256 _block) external onlyOwner {
		setStorageDIP4GenesisBlock(_block);
	}
}
