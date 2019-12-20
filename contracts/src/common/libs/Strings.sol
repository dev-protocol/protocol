pragma solidity ^0.5.0;

library Strings {
	struct slice {
		uint _len;
		uint _ptr;
	}
	function toSlice(string memory self) internal pure returns (slice memory) {
		uint ptr;
		// solium-disable-next-line security/no-inline-assembly
		assembly {
            ptr := add(self, 0x20)
		}
		return slice(bytes(self).length, ptr);
	}
	function concat(slice memory self, slice memory other) internal pure returns (string memory) {
		string memory ret = new string(self._len + other._len);
		uint retptr;
		// solium-disable-next-line security/no-inline-assembly
		assembly { retptr := add(ret, 32) }
		memcpy(retptr, self._ptr, self._len);
		memcpy(retptr + self._len, other._ptr, other._len);
		return ret;
	}
	// solium-disable-next-line security/no-assign-params
	function memcpy(uint dest, uint src, uint len) private pure {
		for(; len >= 32; len -= 32) {
			// solium-disable-next-line security/no-inline-assembly
			assembly {
                mstore(dest, mload(src))
			}
			dest += 32;
			src += 32;
		}
		uint mask = 256 ** (32 - len) - 1;
		// solium-disable-next-line security/no-inline-assembly
		assembly {
            let srcpart := and(mload(src), not(mask))
            let destpart := and(mload(dest), mask)
            mstore(dest, or(destpart, srcpart))
		}
	}
}
