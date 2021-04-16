pragma solidity 0.5.17;

import {UpgraderRole} from "contracts/upgrader/UpgraderRole.sol";

contract UpgraderRoleTest is UpgraderRole {
	function hasOperatingPrivilegesTest(address _sender)
		external
		view
		returns (bool)
	{
		return hasOperatingPrivileges(_sender);
	}

	function onlyAdminAndOperatorTest()
		external
		view
		onlyAdminAndOperator
		returns (bool)
	{
		return true;
	}
}
