pragma solidity ^0.5.0;

import {MarketGroup} from "contracts/src/market/MarketGroup.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {AddressValidator} from "contracts/src/common/validate/AddressValidator.sol";

contract PolicySet is UsingConfig, UsingStorage {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addSet(address _addr) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().policyGroup()
		);

		uint256 index = eternalStorage().getUint(getPlicySetIndex());
		bytes32 key = getIndexKey(index);
		eternalStorage().setAddress(key, _addr);
		index++;
		eternalStorage().setUint(getPlicySetIndex(), index);
	}

	function deleteAll() external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);

		uint256 index = eternalStorage().getUint(getPlicySetIndex());
		for (uint256 i = 0; i < index; i++) {
			bytes32 key = getIndexKey(index);
			eternalStorage().setAddress(key, address(0));
		}
		eternalStorage().setUint(getPlicySetIndex(), 0);
	}

	function count() external view returns (uint256) {
		return eternalStorage().getUint(getPlicySetIndex());
	}

	function get(uint256 _index) external view returns (address) {
		bytes32 key = getIndexKey(_index);
		return eternalStorage().getAddress(key);
	}

	function getIndexKey(uint256 _index) private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_index", _index));
	}

	function getPlicySetIndex() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_policySetIndex"));
	}
}
