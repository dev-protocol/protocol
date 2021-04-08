pragma solidity 0.5.17;

import {Lockup} from "contracts/src/lockup/Lockup.sol";
import {LockupStorageTest} from "contracts/test/lockup/LockupStorageTest.sol";

contract LockupTest is LockupStorageTest, Lockup {
	constructor(address _config, address _devMinter) public Lockup(_config, _devMinter) {}
}
