// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface IDevProtocolAccess {
	function transferOwnership(address _target) external;
	function renounceMinter() external;
	function addMinter(address _account) external;
	function forceAttachPolicy(address _nextPolicy) external;
}
