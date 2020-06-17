pragma solidity ^0.5.0;

contract ILockup {
	function lockup(address _from, address _property, uint256 _value)
		external;

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
