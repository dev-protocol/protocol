pragma solidity ^0.5.0;

import "../market/MarketGroup.sol";
import "../common/storage/UsingStorage.sol";

contract PolicySet is UsingStorage {
	function addSet(address _addr) external {
		uint256 index = eternalStorage().getUint(
			keccak256("_policySetIndex")
		);
		bytes32 key = getKey(index);
		eternalStorage().setAddress(key, _addr);
		index++;
		eternalStorage().setUint(keccak256("_policySetIndex"), index);
	}

	function count() external view returns (uint256) {
		return eternalStorage().getUint(keccak256("_policySetIndex"));
	}

	function get(uint256 _index) external view returns (address) {
		bytes32 key = getKey(_index);
		return eternalStorage().getAddress(key);
	}

	function deleteAll() external {
		uint256 index = eternalStorage().getUint(
			keccak256("_policySetIndex")
		);
		for (uint256 i = 0; i < index; i++) {
			bytes32 key = getKey(index);
			eternalStorage().setAddress(key, address(0));
		}
		eternalStorage().setUint(keccak256("_policySetIndex"), 0);
	}

	function getKey(uint256 _index) private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_policySet", _index));
	}
}
