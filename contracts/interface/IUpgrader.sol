// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface IUpgrader {
	function setPatch(address _patch) external;

	function execute() external;

	function transferOwnership(address _target) external;

	function renounceMinter() external;

	function addMinter(address _account) external;

	function addUpgradeEvent(
		string calldata _name,
		address _current,
		address _next
	) external;

	function forceAttachPolicy(address _nextPolicy) external;
}
