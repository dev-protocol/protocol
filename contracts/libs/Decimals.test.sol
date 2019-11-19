pragma solidity ^0.5.0;

import "./Decimals.sol";

contract DecimalsTest {
	using Decimals for uint256;

	function ratioInto(uint256 _a, uint256 _b)
		public
		pure
		returns (uint256 result, uint256 basis)
	{
		return _a.ratioInto(_b);
	}

	function percentOf(uint256 _a, uint256 _b)
		public
		pure
		returns (uint256 result, uint256 basis)
	{
		return _a.percentOf(_b);
	}
}
