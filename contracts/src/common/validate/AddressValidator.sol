pragma solidity ^0.6.0;

import {ContractGroup} from "contracts/src/common/abstract/ContractGroup.sol";


contract AddressValidator {
	string constant errorMessage = "this is illegal address";

	function validateIllegalAddress(address _addr) external pure {
		require(_addr != address(0), errorMessage);
	}

	function validateGroup(address _addr, address _groupAddr) external view {
		require(ContractGroup(_groupAddr).isGroup(_addr), errorMessage);
	}

	function validateGroups(
		address _addr,
		address _groupAddr1,
		address _groupAddr2
	) external view {
		if (ContractGroup(_groupAddr1).isGroup(_addr)) {
			return;
		}
		require(ContractGroup(_groupAddr2).isGroup(_addr), errorMessage);
	}

	function validateAddress(address _addr, address _target) external pure {
		require(_addr == _target, errorMessage);
	}

	function validateAddresses(
		address _addr,
		address _target1,
		address _target2
	) external pure {
		if (_addr == _target1) {
			return;
		}
		require(_addr == _target2, errorMessage);
	}
}
