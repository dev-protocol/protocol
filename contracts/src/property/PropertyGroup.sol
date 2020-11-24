pragma solidity 0.5.17;

import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {IPropertyGroup} from "contracts/interface/IPropertyGroup.sol";

contract PropertyGroup is UsingConfig, UsingStorage, IPropertyGroup {
	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external {
		require(
			msg.sender == config().propertyFactory(),
			"this is illegal address"
		);

		require(
			eternalStorage().getBool(getGroupKey(_addr)) == false,
			"already enabled"
		);
		eternalStorage().setBool(getGroupKey(_addr), true);
	}

	function isGroup(address _addr) external view returns (bool) {
		return eternalStorage().getBool(getGroupKey(_addr));
	}

	function getGroupKey(address _addr) private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_group", _addr));
	}
}
