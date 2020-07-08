pragma solidity ^0.5.0;

contract IProperty {
	function author() external view returns (address);
	function withdraw(address _sender, uint256 _value) external;
}
