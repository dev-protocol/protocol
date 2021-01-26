pragma solidity 0.5.17;

import {LockupMigration} from "contracts/src/lockup/LockupMigration.sol";

contract LockupMigrationTest is LockupMigration {
	constructor(address _config) public LockupMigration(_config) {}

	function prepare() external {
		setStorageCumulativeHoldersRewardCap(10);
	}
}
