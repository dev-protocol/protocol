// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface IProperty {
	function author() external view returns (address);

	function withdraw(address _sender, uint256 _value) external;
}
