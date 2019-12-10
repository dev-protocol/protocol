pragma solidity ^0.5.0;

import "../common/storage/UsingStorage.sol";
import "../common/config/UsingConfig.sol";
import "../common/validate/SenderValidator.sol";
import "../common/interface/IGroup.sol";

contract PropertyGroup is UsingConfig, UsingStorage, IGroup {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) public {
		new SenderValidator().validateSender(
			msg.sender,
			config().propertyFactory()
		);
		require(_addr != address(0), "property is an invalid address");
		eternalStorage().setBool(getKey(_addr), true);
	}

	function isGroup(address _addr) public view returns (bool) {
		return eternalStorage().getBool(getKey(_addr));
	}
}
