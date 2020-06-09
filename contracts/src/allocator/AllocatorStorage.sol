pragma solidity ^0.5.0;

import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";

contract AllocatorStorage is UsingStorage, UsingConfig, UsingValidator {
	constructor(address _config) public UsingConfig(_config) UsingStorage() {}
}
