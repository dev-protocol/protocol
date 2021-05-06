pragma solidity 0.5.17;

import {LockupMigration} from "contracts/src/lockup/LockupMigration.sol";

contract LockupMigrationTest is LockupMigration {
	constructor(address _config, address _devMinter)
		public
		LockupMigration(_config, _devMinter)
	{}

	function prepare() external {
		setStorageCumulativeHoldersRewardCap(10);
	}
}
