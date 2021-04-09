// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface IPatch {
	function config() external view returns (address);

	function upgrader() external view returns (address);

	function deployedContract() external view returns (address);

	function deploy() external;
}
