// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface IPatch {
	function setConfigAddress(address _config) external;
	function run() external;
	function afterRun() external;
}
