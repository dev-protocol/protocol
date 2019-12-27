pragma solidity ^0.5.0;

contract StringValidator {
	function validatePropertyName(string calldata _name) external pure {
		uint256 len = bytes(_name).length;
		require(
			len >= 3,
			"name must be at least 3 and no more than 10 characters"
		);
		require(
			len <= 10,
			"name must be at least 3 and no more than 10 characters"
		);
	}
	function validatePropertySymbol(string calldata _symbol) external pure {
		uint256 len = bytes(_symbol).length;
		require(
			len >= 3,
			"symbol must be at least 3 and no more than 10 characters"
		);
		require(
			len <= 10,
			"symbol must be at least 3 and no more than 10 characters"
		);
	}
}
