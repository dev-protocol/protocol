pragma solidity ^0.5.0;


import "../common/storage/UsingStorage.sol";
import "../common/config/UsingConfig.sol";
import "../common/validate/SenderValidator.sol";

contract PropertyGroup is UsingConfig, UsingStorage {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addProperty(address _property) public {
		new SenderValidator().validateSender(msg.sender, config().propertyFactory());
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
