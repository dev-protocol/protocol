pragma solidity ^0.5.0;

contract PolicyVoteCounter {
	uint256 private _policyVoteCount;
	mapping(address => uint256) private _voteCountByProperty;
	function addPolicyVoteCount() public {
		_policyVoteCount++;
	}
	function addVoteCountByProperty(address _propertyAddress) public {
		_voteCountByProperty[_propertyAddress]++;
	}
	function resetVoteCountByProperty(address _propertyAddress) public {
		_voteCountByProperty[_propertyAddress] = _policyVoteCount;
	}
	function getAbstentionCount(address _propertyAddress)
		public
		view
		returns (uint256)
	{
		return _policyVoteCount - _voteCountByProperty[_propertyAddress];
	}
}
