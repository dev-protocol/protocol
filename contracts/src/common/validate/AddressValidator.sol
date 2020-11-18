pragma solidity 0.5.17;

import {IGroup} from "contracts/src/common/interface/IGroup.sol";

/**
 * A module that provides common validations patterns.
 */
contract AddressValidator {
	string private constant ERROR_MESSAGE = "this is illegal address";

	/**
	 * Validates passed address is not a zero address.
	 */
	function validateIllegalAddress(address _addr) external pure {
		require(_addr != address(0), ERROR_MESSAGE);
	}

	/**
	 * Validates passed address is included in an address set.
	 */
	function validateGroup(address _addr, address _groupAddr) external view {
		require(IGroup(_groupAddr).isGroup(_addr), ERROR_MESSAGE);
	}

	/**
	 * Validates passed address is included in two address sets.
	 */
	function validateGroups(
		address _addr,
		address _groupAddr1,
		address _groupAddr2
	) external view {
		if (IGroup(_groupAddr1).isGroup(_addr)) {
			return;
		}
		require(IGroup(_groupAddr2).isGroup(_addr), ERROR_MESSAGE);
	}

	/**
	 * Validates that the address of the first argument is equal to the address of the second argument.
	 */
	function validateAddress(address _addr, address _target) external pure {
		require(_addr == _target, ERROR_MESSAGE);
	}

	/**
	 * Validates passed address equals to the two addresses.
	 */
	function validateAddresses(
		address _addr,
		address _target1,
		address _target2
	) external pure {
		if (_addr == _target1) {
			return;
		}
		require(_addr == _target2, ERROR_MESSAGE);
	}

	/**
	 * Validates passed address equals to the three addresses.
	 */
	function validate3Addresses(
		address _addr,
		address _target1,
		address _target2,
		address _target3
	) external pure {
		if (_addr == _target1) {
			return;
		}
		if (_addr == _target2) {
			return;
		}
		require(_addr == _target3, ERROR_MESSAGE);
	}
}
