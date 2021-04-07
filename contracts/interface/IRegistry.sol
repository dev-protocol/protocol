// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface IRegistry {
	function set(string calldata _name, address _addr) external;

	function get(string calldata _name) external view returns (address);
}
