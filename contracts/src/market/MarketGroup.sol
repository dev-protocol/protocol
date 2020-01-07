pragma solidity ^0.5.0;

import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {AddressValidator} from "contracts/src/common/validate/AddressValidator.sol";
import {IGroup} from "contracts/src/common/interface/IGroup.sol";

contract MarketGroup is UsingConfig, UsingStorage, IGroup {
	mapping(address => bool) private _markets;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) UsingStorage() {}

	function addGroup(address _addr) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().marketFactory()
		);

		require(isGroup(_addr) == false, "already enabled");
		eternalStorage().setBool(getGroupKey(_addr), true);
	}

	function isGroup(address _addr) public view returns (bool) {
		return eternalStorage().getBool(getGroupKey(_addr));
	}
}
