pragma solidity ^0.6.0;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";


library Decimals {
	using SafeMath for uint256;
	uint120 private constant basisValue = 1000000000000000000;

	function outOf(uint256 _a, uint256 _b)
		internal
		pure
		returns (uint256 result)
	{
		if (_a == 0) {
			return 0;
		}
		uint256 a = _a.mul(basisValue);
		require(a > _b, "the denominator is too big");
		return (a.div(_b));
	}

	function basis() external pure returns (uint120) {
		return basisValue;
	}
}
