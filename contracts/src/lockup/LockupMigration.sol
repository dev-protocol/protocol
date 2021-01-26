pragma solidity 0.5.17;

import {Lockup} from "contracts/src/lockup/Lockup.sol";

contract LockupMigration is Lockup {
	constructor(address _config) public Lockup(_config) {}

	function lockup(
		// solhint-disable-next-line no-unused-vars
		address _from,
		// solhint-disable-next-line no-unused-vars
		address _property,
		// solhint-disable-next-line no-unused-vars
		uint256 _value
	) external {
		require(false, "under maintenance");
	}

	// solhint-disable-next-line no-unused-vars
	function withdraw(address _property, uint256 _amount) external {
		require(false, "under maintenance");
	}

	function setInitialCumulativeHoldersRewardCap(address _property)
		external
		onlyOwner
	{
		/**
		 * Validates the value is not set.
		 */
		require(
			getStorageInitialCumulativeHoldersRewardCap(_property) == 0,
			"already set the value"
		);

		uint256 cCap = getStorageCumulativeHoldersRewardCap();

		/**
		 * Sets the value.
		 */
		setStorageInitialCumulativeHoldersRewardCap(_property, cCap);
	}
}
