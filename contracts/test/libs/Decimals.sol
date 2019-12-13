pragma solidity ^0.5.0;

import "contracts/src/common/libs/Decimals.sol";

contract DecimalsTest {
	using Decimals for uint256;

	function outOf(uint256 _a, uint256 _b)
		public
		pure
		returns (uint256 result, uint256 basis)
	{
		return _a.outOf(_b);
	}
}
