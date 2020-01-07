pragma solidity ^0.5.0;

import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {AddressValidator} from "contracts/src/common/validate/AddressValidator.sol";
import {IGroup} from "contracts/src/common/interface/IGroup.sol";
import {PolicySet} from "contracts/src/policy/PolicySet.sol";

contract PolicyGroup is UsingConfig, UsingStorage, IGroup {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);

		require(isGroup(_addr) == false, "already enabled");
		eternalStorage().setBool(getGroupKey(_addr), true);
		PolicySet policySet = PolicySet(config().policySet());
		policySet.addSet(_addr);
	}

	function deleteGroup(address _addr) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);

		require(isGroup(_addr), "not enabled");
		return eternalStorage().setBool(getGroupKey(_addr), false);
	}

	function isGroup(address _addr) public view returns (bool) {
		return eternalStorage().getBool(getGroupKey(_addr));
	}
}
