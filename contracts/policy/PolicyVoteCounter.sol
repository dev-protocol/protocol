pragma solidity ^0.5.0;

contract PolicyVoteCounter {
	uint256 private _policyVoteCount;
	mapping(address => uint256) private _voteCountByProperty;
	function addPolicyVoteCount() public {
		_policyVoteCount++;
	}
	function addVoteCountByProperty(address propertyAddress) public {
		_voteCountByProperty[propertyAddress]++;
	}
	function resetVoteCountByProperty(address propertyAddress) public {
		_voteCountByProperty[propertyAddress] = _policyVoteCount;
	}
	function getAbstentionCount(address propertyAddress)
		public
		view
		returns (uint256)
	{
		return _policyVoteCount - _voteCountByProperty[propertyAddress];
	}
}
