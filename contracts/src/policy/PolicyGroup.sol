pragma solidity 0.5.17;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import "../common/config/UsingConfig.sol";
import "../common/storage/UsingStorage.sol";
import "../../interface/IPolicyGroup.sol";
import "../../interface/IPolicy.sol";

contract PolicyGroup is UsingConfig, UsingStorage, IPolicyGroup {
	using SafeMath for uint256;

	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external {
		require(
			msg.sender == config().policyFactory(),
			"this is illegal address"
		);
		bytes32 key = getGroupKey(_addr);
		require(eternalStorage().getBool(key) == false, "already group");
		eternalStorage().setBool(key, true);
		setVotingEndBlockNumber(_addr);
	}

	function isGroup(address _addr) external view returns (bool) {
		return eternalStorage().getBool(getGroupKey(_addr));
	}

	function isDuringVotingPeriod(address _policy)
		external
		view
		returns (bool)
	{
		bytes32 key = getVotingEndBlockNumberKey(_policy);
		uint256 votingEndBlockNumber = eternalStorage().getUint(key);
		return block.number < votingEndBlockNumber;
	}

	function setVotingEndBlockNumber(address _policy) private {
		require(
			msg.sender == config().policyFactory(),
			"this is illegal address"
		);
		bytes32 key = getVotingEndBlockNumberKey(_policy);
		uint256 tmp = IPolicy(config().policy()).policyVotingBlocks();
		uint256 votingEndBlockNumber = block.number.add(tmp);
		eternalStorage().setUint(key, votingEndBlockNumber);
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
