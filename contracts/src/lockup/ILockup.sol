pragma solidity ^0.5.0;

contract ILockup {
	function getPropertyValue(address _property)
		external
		view
		returns (uint256);

	function getAllValue() external view returns (uint256);

	function getValue(address _property, address _sender)
		external
		view
		returns (uint256);
}
