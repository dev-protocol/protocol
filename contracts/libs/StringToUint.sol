pragma solidity ^0.5.0;

library StringToUint {
	function toUint(string memory _a, uint _b)
		internal
		pure
		returns (uint _parsedInt)
	{
		bytes memory bresult = bytes(_a);
		uint b = _b;
		uint mint = 0;
		bool decimals = false;
		for (uint i = 0; i < bresult.length; i++) {
			if (
				(uint(uint8(bresult[i])) >= 48) && (
					uint(uint8(bresult[i])) <= 57
				)
			) {
				if (decimals) {
					if (b == 0) {
						break;
					} else {
						b--;
					}
				}
				mint *= 10;
				mint += uint(uint8(bresult[i])) - 48;
			} else if (uint(uint8(bresult[i])) == 46) {
				decimals = true;
			}
		}
		if (b > 0) {
			mint *= 10 ** b;
		}
		return mint;
	}
}
