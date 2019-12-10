pragma solidity ^0.5.0;

contract IntValidator {
	function validateEmpty(uint256 _uInt) external pure {
		require(_uInt != 0, "this int is not proper");
	}
}
