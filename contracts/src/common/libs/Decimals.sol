pragma solidity 0.5.17;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";

/**
 * Library for emulating calculations involving decimals.
 */
library Decimals {
	using SafeMath for uint256;
	uint120 private constant BASIS_VAKUE = 1000000000000000000;

	/**
	 * Returns the ratio of the first argument to the second argument.
	 */
	function outOf(uint256 _a, uint256 _b)
		internal
		pure
		returns (uint256 result)
	{
		if (_a == 0) {
			return 0;
		}
		uint256 a = _a.mul(BASIS_VAKUE);
		if (a < _b) {
			return 0;
		}
		return (a.div(_b));
	}

	/**
	 * Returns multiplied the number by 10^18.
	 * This is used when there is a very large difference between the two numbers passed to the `outOf` function.
	 */
	function mulBasis(uint256 _a) internal pure returns (uint256) {
		return _a.mul(BASIS_VAKUE);
	}

	/**
	 * Returns by changing the numerical value being emulated to the original number of digits.
	 */
	function divBasis(uint256 _a) internal pure returns (uint256) {
		return _a.div(BASIS_VAKUE);
	}
}
