pragma solidity ^0.5.0;

import "./Decimals.sol";

contract DecimalsTest {
	using Decimals for uint256;

	function outOf(uint256 _a, uint256 _b)
		public
		pure
		returns (uint256 result, uint256 basis)
	{
		return _a.outOf(_b);
	}

	function multipliedBy(uint256 _a, uint256 _b, uint256 _decimals)
		public
		pure
		returns (uint256 result, uint256 basis)
	{
		return _a.multipliedBy(_b, _decimals);
	}
}
