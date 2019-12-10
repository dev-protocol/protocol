pragma solidity ^0.5.0;

contract StringValidator {
	function validateEmpty(string calldata _str) external pure {
		uint256 len = bytes(_str).length;
		require(len != 0, "this string is not proper");
	}
}
