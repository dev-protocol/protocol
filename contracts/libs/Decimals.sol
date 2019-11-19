pragma solidity ^0.5.0;

library Decimals {
	function _basis() internal pure returns (uint256) {
		return 1000000000000000000;
	}

	function outOf(uint256 _a, uint256 _b)
		internal
		pure
		returns (uint256 result, uint256 basis)
	{
		uint256 base = _basis();
		uint256 numerator = base * base;
		return ((_a * numerator) / (_b * base), base);
	}
}
