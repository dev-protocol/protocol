// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface IPatch {
	function upgrader() external view returns (bool);

	function config() external view returns (bool);

	function setConfigAddress(address _config) external;

	function run() external;

	function afterRun() external;
}
