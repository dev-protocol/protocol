pragma solidity ^0.5.0;

import "../config/UsingConfig.sol";
import "../storage/UsingStorage.sol";

contract VoteTimes is UsingStorage {

	constructor(address _config) public UsingStorage(_config, keccak256("VoteTimes")){}

	function addVoteCount() public {
		eternalStorage().uInt().increment(keccak256("_voteTimes"));
	}
	function addVoteTimesByProperty(address _property) public {
		eternalStorage().addressUIntMap().increment("_voteTimesByProperty", _property);
	}
	function resetVoteTimesByProperty(address _property) public {
		uint256 voteTimes = eternalStorage().uInt().get(keccak256("_voteTimes"));
		eternalStorage().addressUIntMap().set("_voteTimesByProperty", _property, voteTimes);
	}
	function getAbstentionTimes(address _property)
		public
		view
		returns (uint256)
	{
		uint256 voteTimes = eternalStorage().uInt().get(keccak256("_voteTimes"));
		uint256 voteTimesByProperty = eternalStorage().addressUIntMap().get("_voteTimesByProperty", _property);
		return voteTimes - voteTimesByProperty;
	}
}
