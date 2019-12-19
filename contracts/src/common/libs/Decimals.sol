pragma solidity ^0.5.0;

library Decimals {
	uint120 private constant basisValue = 1000000000000000000000000000000000000;

	function outOf(uint256 _a, uint256 _b)
		internal
		pure
		returns (uint256 result)
	{
		uint256 a = _a * basisValue;
		require(a > _b, "the denominator is too big");
		return (a / _b);

	}
	function basis() external pure returns (uint120) {
		return basisValue;
	}
}
