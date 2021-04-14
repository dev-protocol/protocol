pragma solidity 0.5.17;

import {Roles} from "@openzeppelin/contracts/access/Roles.sol";

contract UpgraderRole {
	using Roles for Roles.Role;

	Roles.Role private _admins;
	Roles.Role private _operators;

	modifier onlyAdmin() {
		require(_admins.has(msg.sender), "does not have admin role");
		_;
	}

	modifier onlyOperator() {
		require(isOperator(), "does not have operator role.");
		_;
	}

	function isOperator() internal returns (bool) {
		bool hasAdminRole = _admins.has(msg.sender);
		if (hasAdminRole) {
			return true;
		}
		return _operators.has(msg.sender);
	}

	function addAdmin(address _account) external onlyAdmin {
		_admins.add(_account);
	}

	function removeAdmin(address _account) external onlyAdmin {
		_admins.remove(_account);
	}

	function hasAdmin(address _account) external {
		_admins.has(_account);
	}

	function addOperator(address _account) external onlyAdmin {
		_operators.add(_account);
	}

	function removeOperator(address _account) external onlyAdmin {
		_operators.remove(_account);
	}

	function hasOperator(address _account) external {
		_operators.has(_account);
	}
}
