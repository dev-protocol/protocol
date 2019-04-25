pragma solidity ^0.5.0;

library UintToString {
	function toString(uint _i) internal pure returns (string memory _string) {
		uint256 i = _i;
		if (i == 0) {
			return "0";
		}
		uint j = i;
		uint len;
		while (j != 0) {
			len++;
			j /= 10;
		}
		bytes memory bstr = new bytes(len);
		uint k = len - 1;
		while (i != 0) {
			bstr[k--] = byte(uint8(48 + i % 10));
			i /= 10;
		}
		return string(bstr);
	}
}
