// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface IUpgrader {
	function setPatch(address _patch) external;

	function execute() external;

	function pauseDevMinter() external;

	function unpauseDevMinter() external;

	function forceAttachPolicy(address _nextPolicy) external;

	function transferOwnership(address _target) external;

	function addUpgradeEvent(string calldata _name, address _current, address _next) external;
}
