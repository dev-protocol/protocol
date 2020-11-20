pragma solidity 0.5.17;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {IPolicyGroup} from "contracts/interface/IPolicyGroup.sol";
import {IPolicy} from "contracts/src/policy/IPolicy.sol";

contract PolicyGroup is UsingConfig, UsingStorage, IPolicyGroup {
	using SafeMath for uint256;

	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external {
		innerAddGroupWithoutSetVotingEnd(_addr);
		/**
		 * Resets the voting period because a new Policy has been added.
		 */
		setVotingEndBlockNumber(_addr);
	}

	function addGroupWithoutSetVotingEnd(address _addr) external {
		innerAddGroupWithoutSetVotingEnd(_addr);
	}

	function incrementVotingGroupIndex() external {
		require(
			msg.sender == config().policyFactory(),
			"this is illegal address"
		);

		bytes32 key = getVotingGroupIndexKey();
		uint256 idx = eternalStorage().getUint(key);
		idx++;
		eternalStorage().setUint(key, idx);
	}

	function isGroup(address _addr) external view returns (bool) {
		return eternalStorage().getBool(getPolicyGroupKey(_addr));
	}

	function getVotingGroupIndex() external view returns (uint256) {
		return eternalStorage().getUint(getVotingGroupIndexKey());
	}

	function voting(address _policy) external view returns (bool) {
		bytes32 key = getVotingEndBlockNumberKey(_policy);
		uint256 limit = eternalStorage().getUint(key);
		return block.number <= limit;
	}

	function innerAddGroupWithoutSetVotingEnd(address _addr) private {
		require(
			msg.sender == config().policyFactory(),
			"this is illegal address"
		);

		require(
			eternalStorage().getBool(getPolicyGroupKey(_addr)) == false,
			"already group"
		);
		eternalStorage().setBool(getPolicyGroupKey(_addr), true);
	}

	function setVotingEndBlockNumber(address _policy) private {
		bytes32 key = getVotingEndBlockNumberKey(_policy);
		uint256 tmp = IPolicy(config().policy()).policyVotingBlocks();
		uint256 votingEndBlockNumber = block.number.add(tmp);
		eternalStorage().setUint(key, votingEndBlockNumber);
	}

	function getPolicyGroupKey(address _addr) private view returns (bytes32) {
		uint256 idx = eternalStorage().getUint(getVotingGroupIndexKey());
		return keccak256(abi.encodePacked("_group", idx, _addr));
	}

	function getVotingGroupIndexKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_votingGroupIndex"));
	}

	function getVotingEndBlockNumberKey(address _policy)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_votingEndBlockNumber", _policy));
	}

	function getGroupKey(address _addr) private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_group", _addr));
	}
}
