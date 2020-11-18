pragma solidity 0.5.17;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {IPolicyGroup} from "contracts/src/policy/IPolicyGroup.sol";
import {IPolicy} from "contracts/src/policy/IPolicy.sol";

contract PolicyGroup is
	UsingConfig,
	UsingStorage,
	UsingValidator,
	IPolicyGroup
{
	using SafeMath for uint256;

	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external {
		addGroupWithoutSetVotingEnd(_addr);
		/**
		 * Resets the voting period because a new Policy has been added.
		 */
		setVotingEndBlockNumber(_addr);
	}

	function addGroupWithoutSetVotingEnd(address _addr) public {
		addressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);

		require(isGroup(_addr) == false, "already group");
		eternalStorage().setBool(getPolicyGroupKey(_addr), true);
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

	function isGroup(address _addr) public view returns (bool) {
		return eternalStorage().getBool(getPolicyGroupKey(_addr));
	}

	function getVotingGroupIndex() public view returns (uint256) {
		bytes32 key = getVotingGroupIndexKey();
		return eternalStorage().getUint(key);
	}

	function voting(address _policy) external view returns (bool) {
		bytes32 key = getVotingEndBlockNumberKey(_policy);
		uint256 limit = eternalStorage().getUint(key);
		return block.number <= limit;
	}

	function setVotingEndBlockNumber(address _policy) private {
		bytes32 key = getVotingEndBlockNumberKey(_policy);
		uint256 tmp = IPolicy(config().policy()).policyVotingBlocks();
		uint256 votingEndBlockNumber = block.number.add(tmp);
		eternalStorage().setUint(key, votingEndBlockNumber);
	}

	function getVotingGroupIndexKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_votingGroupIndex"));
	}

	function getPolicyGroupKey(address _addr) private view returns (bytes32) {
		uint256 idx = getVotingGroupIndex();
		return keccak256(abi.encodePacked("_group", idx, _addr));
	}

	function getVotingEndBlockNumberKey(address _policy)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_votingEndBlockNumber", _policy));
	}
}
