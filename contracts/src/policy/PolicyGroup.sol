pragma solidity ^0.6.0;

import {Killable} from "contracts/src/common/lifecycle/Killable.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {ContractGroup} from "contracts/src/common/abstract/ContractGroup.sol";


contract PolicyGroup is
	UsingConfig,
	UsingStorage,
	UsingValidator,
	ContractGroup,
	Killable
{
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external override {
		addressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);

		require(isGroup(_addr) == false, "already enabled");
		eternalStorage().setBool(getGroupKey(_addr), true);
	}

	function deleteGroup(address _addr) external {
		addressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);

		require(isGroup(_addr), "not enabled");
		return eternalStorage().setBool(getGroupKey(_addr), false);
	}

	function isGroup(address _addr) public override view returns (bool) {
		return eternalStorage().getBool(getGroupKey(_addr));
	}
}
