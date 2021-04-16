pragma solidity 0.5.17;

import {PatchBase} from "contracts/upgrader/patch/PatchBase.sol";

contract PatchTemplate is PatchBase {
	function run() external onlyUpgrader whenNotPaused {
		// Deploy the contract and execute the post-processing
		// corresponding to the contract.

		// ex) Allocator
		// Allocator allocator = new Allocator(config)
		// afterDeployAllocator(address(allocator));

		// ex) Lockup
		// Lockup lockup = new Lockup(config, 0x00000.....)
		// afterDeployLockup(address(lockup));
	}
}
