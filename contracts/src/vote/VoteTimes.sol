pragma solidity ^0.5.0;

import "../common/storage/UsingStorage.sol";

contract VoteTimes is UsingStorage {
	constructor() public UsingStorage() {}

	function addVoteCount() public {
		uint256 voteTimes = eternalStorage().getUint(keccak256("_voteTimes"));
		voteTimes++;
		eternalStorage().setUint(keccak256("_voteTimes"), voteTimes);
	}

	function addVoteTimesByProperty(address _property) public {
		bytes32 key = keccak256(
			abi.encodePacked("_voteTimesByProperty", _property)
		);
		uint256 voteTimesByProperty = eternalStorage().getUint(key);
		voteTimesByProperty++;
		eternalStorage().setUint(key, voteTimesByProperty);
	}
	function resetVoteTimesByProperty(address _property) public {
		uint256 voteTimes = eternalStorage().getUint(keccak256("_voteTimes"));
		bytes32 key = keccak256(
			abi.encodePacked("_voteTimesByProperty", _property)
		);
		eternalStorage().setUint(key, voteTimes);
	}
	function getAbstentionTimes(address _property)
		public
		view
		returns (uint256)
	{
		uint256 voteTimes = eternalStorage().getUint(keccak256("_voteTimes"));
		bytes32 key = keccak256(
			abi.encodePacked("_voteTimesByProperty", _property)
		);
		uint256 voteTimesByProperty = eternalStorage().getUint(key);
		return voteTimes - voteTimesByProperty;
	}
}
