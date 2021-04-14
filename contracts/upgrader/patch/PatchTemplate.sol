pragma solidity 0.5.17;

import {PatchBase} from "contracts/upgrader/patch/PatchBase.sol";
import {IAddressConfig} from "contracts/interface/IAddressConfig.sol";

contract PatchTemplate is PatchBase {
	function run() external onlyUpgrader whenNotPaused {
		// Deploy the contract and register the address.
		// Delegate storage privileges if necessary.
		// ex) Allocator
		// Allocator allocator = new Allocator(config)
		// afterDeployAllocator(address(allocator));
		// ex) Lockup
		// Lockup lockup = new Lockup(config, 0x00000.....)
		// afterDeployLockup(address(lockup));
	}
}
