pragma solidity ^0.5.0;

import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";

contract AllocatorStorage is UsingStorage, UsingConfig, UsingValidator {
	constructor(address _config) public UsingConfig(_config) UsingStorage() {}

	// Last Block Number
	function setLastBlockNumber(address _property, uint256 _blocks) external {
		addressValidator().validateAddress(msg.sender, config().allocator());

		eternalStorage().setUint(getLastBlockNumberKey(_property), _blocks);
	}

	function getLastBlockNumber(address _property)
		external
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getLastBlockNumberKey(_property));
	}

	function getLastBlockNumberKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_lastBlockNumber", _property));
	}
}
