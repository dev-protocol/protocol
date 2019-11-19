pragma solidity ^0.5.0;

library Decimals {
	function _basis() internal pure returns (uint256) {
		return 1000000000000000000;
	}

	function ratioInto(uint256 _a, uint256 _b)
		internal
		pure
		returns (uint256 result, uint256 basis)
	{
		uint256 base = _basis();
		uint256 numerator = base * base;
		return ((_a * numerator) / (_b * base), base);
	}

	function percentOf(uint256 _a, uint256 _b)
		internal
		pure
		returns (uint256 result, uint256 basis)
	{
		uint256 base = _basis();
		uint256 numerator = base * base;
		uint256 primaryNumerator = numerator * base;
		return (
			(_a * primaryNumerator) / ((_a * numerator) / (_b * base) / _a),
			base * 100000000000000000000
		);
	}
}
