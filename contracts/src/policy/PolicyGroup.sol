pragma solidity ^0.5.0;

import "../common/storage/UsingStorage.sol";
import "../common/config/UsingConfig.sol";
import "../common/validate/AddressValidator.sol";
import "../common/interface/IGroup.sol";

contract PolicyGroup is UsingConfig, UsingStorage, IGroup {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);
		eternalStorage().setBool(getAddressKey(_addr), true);
	}

	function deleteGroup(address _addr) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);
		return eternalStorage().setBool(getAddressKey(_addr), false);
	}

	function isGroup(address _addr) external view returns (bool) {
		return eternalStorage().getBool(getAddressKey(_addr));
	}

}
