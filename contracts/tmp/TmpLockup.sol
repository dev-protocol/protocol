pragma solidity 0.5.17;

import {Lockup} from "contracts/src/lockup/Lockup.sol";

contract TmpLockup is Lockup {
	constructor(address _config) public Lockup(_config) {}

	function setDevMint(address _devMint) external onlyOwner {
		setStorageDevMinter(_devMint);
	}
}
