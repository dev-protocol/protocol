pragma solidity ^0.5.0;

import "../common/modifier/UsingModifier.sol";
import "../common/storage/UsingStorage.sol";

contract PropertyGroup is UsingModifier, UsingStorage {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingModifier(_config) {}

	function addProperty(address _property) public onlyPropertyFactory {
		require(_property != address(0), "property is an invalid address");
		eternalStorage().setBool(getKey(_property), true);
	}

	function getKey(address _property) private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_propertyGroup", _property));
	}

	function isProperty(address _property) public view returns (bool) {
		return eternalStorage().getBool(getKey(_property));
	}
}
