pragma solidity ^0.6.0;

import {Decimals} from "contracts/src/common/libs/Decimals.sol";


contract DecimalsTest {
	using Decimals for uint256;

	function outOf(uint256 _a, uint256 _b)
		external
		pure
		returns (uint256 result)
	{
		return _a.outOf(_b);
	}
}
