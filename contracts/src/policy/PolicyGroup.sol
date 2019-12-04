pragma solidity ^0.5.0;

import "../market/MarketGroup.sol";
import "../common/storage/UsingStorage.sol";

contract PolicyGroup is UsingStorage {
	function add(address _policy) external {
		uint256 index = eternalStorage().getUint(
			keccak256("_policyGroupIndex")
		);
		bytes32 key = getKey(index);
		eternalStorage().setAddress(key, _policy);
		index++;
		eternalStorage().setUint(keccak256("_policyGroupIndex"), index);
	}

	function count() external view returns (uint256) {
		return eternalStorage().getUint(keccak256("_policyGroupIndex"));
	}

	function get(uint256 _index) external view returns (address) {
		bytes32 key = getKey(_index);
		return eternalStorage().getAddress(key);
	}

	function deleteAll() external {
		uint256 index = eternalStorage().getUint(
			keccak256("_policyGroupIndex")
		);
		for (uint256 i = 0; i < index; i++) {
			bytes32 key = getKey(index);
			eternalStorage().setAddress(key, address(0));
		}
		eternalStorage().setUint(keccak256("_policyGroupIndex"), 0);
	}

	function getKey(uint256 _index) private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_policyGroup", _index));
	}
}
