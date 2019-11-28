pragma solidity ^0.5.0;


contract VoteTimes {
	uint256 private _voteTimes;
	mapping(address => uint256) private _voteTimesByProperty;
	function addVoteCount() public {
		_voteTimes++;
	}
	function addVoteTimesByProperty(address _property) public {
		_voteTimesByProperty[_property]++;
	}
	function resetVoteTimesByProperty(address _property) public {
		_voteTimesByProperty[_property] = _voteTimes;
	}
	function getAbstentionTimes(address _property)
		public
		view
		returns (uint256)
	{
		return _voteTimes - _voteTimesByProperty[_property];
	}
}
