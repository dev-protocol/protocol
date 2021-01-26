pragma solidity 0.5.17;

import {LockupStorage} from "contracts/src/lockup/LockupStorage.sol";

contract LockupStorageTest is LockupStorage {
	function setStorageAllValueTest(uint256 _value) external {
		setStorageAllValue(_value);
	}

	function setStorageValueTest(
		address _property,
		address _sender,
		uint256 _value
	) external {
		setStorageValue(_property, _sender, _value);
	}

	function setStorageInterestPriceTest(address _property, uint256 _value)
		external
	{
		setStorageInterestPrice(_property, _value);
	}

	function setStorageLastInterestPriceTest(
		address _property,
		address _user,
		uint256 _value
	) external {
		setStorageLastInterestPrice(_property, _user, _value);
	}

	function setStorageLastSameRewardsAmountAndBlockTest(
		uint256 _amount,
		uint256 _block
	) external {
		setStorageLastSameRewardsAmountAndBlock(_amount, _block);
	}

	function setStorageCumulativeGlobalRewardsTest(uint256 _value) external {
		setStorageCumulativeGlobalRewards(_value);
	}

	function setStoragePendingInterestWithdrawalTest(
		address _property,
		address _user,
		uint256 _value
	) external {
		setStoragePendingInterestWithdrawal(_property, _user, _value);
	}

	function setStorageDIP4GenesisBlockTest(uint256 _block) external {
		setStorageDIP4GenesisBlock(_block);
	}

	function setStorageLastStakedInterestPriceTest(
		address _property,
		address _user,
		uint256 _value
	) external {
		setStorageLastStakedInterestPrice(_property, _user, _value);
	}

	function setStorageLastStakesChangedCumulativeRewardTest(uint256 _value)
		external
	{
		setStorageLastStakesChangedCumulativeReward(_value);
	}

	function setStorageLastCumulativeHoldersRewardPriceTest(uint256 _a)
		external
	{
		setStorageLastCumulativeHoldersRewardPrice(_a);
	}

	function setStorageLastCumulativeInterestPriceTest(uint256 _a) external {
		setStorageLastCumulativeInterestPrice(_a);
	}

	function setStorageLastCumulativeHoldersRewardAmountPerPropertyTest(
		address _property,
		uint256 _value
	) external {
		setStorageLastCumulativeHoldersRewardAmountPerProperty(
			_property,
			_value
		);
	}

	function setStorageLastCumulativeHoldersRewardPricePerPropertyTest(
		address _property,
		uint256 _value
	) external {
		setStorageLastCumulativeHoldersRewardPricePerProperty(
			_property,
			_value
		);
	}

	function setStorageGeometricMeanLockedUpTest(uint256 _value) external {
		setStorageGeometricMeanLockedUp(_value);
	}

	function setStorageDisabledLockedupsTest(address _property, uint256 _value)
		external
	{
		setStorageDisabledLockedups(_property, _value);
	}

	function setStorageCumulativeHoldersRewardCapTest(uint256 _value) external {
		setStorageCumulativeHoldersRewardCap(_value);
	}

	function setStorageLastCumulativeHoldersPriceCapTest(uint256 _value)
		external
	{
		setStorageLastCumulativeHoldersPriceCap(_value);
	}

	function setStorageInitialCumulativeHoldersRewardCapTest(
		address _property,
		uint256 _value
	) external {
		setStorageInitialCumulativeHoldersRewardCap(_property, _value);
	}
}
