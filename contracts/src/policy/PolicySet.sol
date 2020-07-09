pragma solidity ^0.5.0;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {IPolicySet} from "contracts/src/policy/IPolicySet.sol";

contract PolicySet is UsingConfig, UsingStorage, UsingValidator, IPolicySet {
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addSet(address _addr) external {
		addressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);

		uint256 index = eternalStorage().getUint(getPlicySetIndexKey());
		bytes32 key = getIndexKey(index);
		eternalStorage().setAddress(key, _addr);
		index = index.add(1);
		eternalStorage().setUint(getPlicySetIndexKey(), index);
	}

	function deleteAll() external {
		addressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);

		uint256 index = eternalStorage().getUint(getPlicySetIndexKey());
		for (uint256 i = 0; i < index; i++) {
			bytes32 key = getIndexKey(i);
			eternalStorage().setAddress(key, address(0));
		}
		eternalStorage().setUint(getPlicySetIndexKey(), 0);
	}

	function incrementVotingGroupIndex() external {
		addressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);
		bytes32 key = getVotingGroupIndexKey();
		uint256 idx = eternalStorage().getUint(key);
		idx++;
		eternalStorage().setUint(key, idx);
	}

	function count() external view returns (uint256) {
		return eternalStorage().getUint(getPlicySetIndexKey());
	}

	function get(uint256 _index) external view returns (address) {
		bytes32 key = getIndexKey(_index);
		return eternalStorage().getAddress(key);
	}

	function getVotingGroupIndex() external view returns (uint256) {
		bytes32 key = getVotingGroupIndexKey();
		return eternalStorage().getUint(key);
	}

	function getVotingGroupIndexKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_votingGroupIndex"));
	}

	function getIndexKey(uint256 _index) private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_index", _index));
	}

	function getPlicySetIndexKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_policySetIndex"));
	}
}
