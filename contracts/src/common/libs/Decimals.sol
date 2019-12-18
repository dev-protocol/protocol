pragma solidity ^0.5.0;

library Decimals {
	function _basis() internal pure returns (uint120) {
		return 1000000000000000000000000000000000000;
	}

	function outOf(uint256 _a, uint256 _b)
		internal
		pure
		returns (uint256 result, uint256 basis)
	{
		uint120 base = _basis();
		uint256 a = _a * base;
		require(a > _b, "the denominator is too big");
		return (a / _b, base);
	}
}
