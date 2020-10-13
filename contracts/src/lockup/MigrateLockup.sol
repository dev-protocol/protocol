pragma solidity 0.5.17;

import {LegacyLockup} from "contracts/src/lockup/LegacyLockup.sol";

contract MigrateLockup is LegacyLockup {
	constructor(address _config) public LegacyLockup(_config) {}

	function __initStakeOnProperty(
		address _property,
		address _user,
		uint256 _cInterestPrice
	) public onlyOwner {
		setStorageLastStakedInterestPrice(_property, _user, _cInterestPrice);
	}

	function __initLastStakeOnProperty(
		address _property,
		uint256 _cHoldersAmountPerProperty,
		uint256 _cHoldersPrice
	) public onlyOwner {
		setStorageLastCumulativeHoldersRewardAmountPerProperty(
			_property,
			_cHoldersAmountPerProperty
		);
		setStorageLastCumulativeHoldersRewardPricePerProperty(
			_property,
			_cHoldersPrice
		);
	}

	function __initLastStake(
		uint256 _cReward,
		uint256 _cInterestPrice,
		uint256 _cHoldersPrice
	) public onlyOwner {
		setStorageLastStakesChangedCumulativeReward(_cReward);
		setStorageLastCumulativeHoldersRewardPrice(_cHoldersPrice);
		setStorageLastCumulativeInterestPrice(_cInterestPrice);
	}
}
