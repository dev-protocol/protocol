// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface IDevProtocolAccess {
	function addressConfig() external view returns(bool);

	function transferOwnership(address _target) external;

	function renounceMinter() external;

	function addMinter() external;

	function forceAttachPolicy(address _nextPolicy) external;
}
