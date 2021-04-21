// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface IUpgrader {
	function execute() external;

	function addUpgradeEvent(
		string calldata _name,
		address _current,
		address _next
	) external;
}
