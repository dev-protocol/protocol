pragma solidity 0.5.17;

import {Lockup} from "../../src/lockup/Lockup.sol";
import {LockupStorageTest} from "./LockupStorageTest.sol";

contract LockupTest is LockupStorageTest, Lockup {
	constructor(address _config, address _devMinter)
		public
		Lockup(_config, _devMinter)
	{}
}
