pragma solidity ^0.5.0;

library Decimals {
	uint256 public constant basisValue = 1000000000000000000;

	function outOf(uint256 _a, uint256 _b)
		internal
		pure
		returns (uint256 result)
	{
		return ((_a * basisValue) / (_b));
	}

	function basis() external pure returns (uint256) {
		return basisValue;
	}

}
