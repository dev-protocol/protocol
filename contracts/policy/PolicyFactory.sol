pragma solidity ^0.5.0;

import "./Policy.sol";
import "./PolicyVote.sol";

contract PolicyFactory is UseState {
	PolicyVote private _policyVote;
	address payable _owner;
	event Create(address indexed _from, address _property);

	constructor() public {
		_policyVote = new PolicyVote();
		_owner = msg.sender;
	}

	function createPolicy(address _newPolicyAddress) public returns (address) {
		Policy policy = new Policy(_owner, _newPolicyAddress);
		address policyAddress = address(policy);
		emit Create(msg.sender, policyAddress);
		_policyVote.vote(policyAddress, 0);
		if (_policyVote.isVoting() == false){
			setPolicy(policyAddress);
		}
		return policyAddress;
	}

	function vote(address _policyAddress, uint256 _vote) public {
		require(_policyVote.isVoting(), "not in voting period.");
		_policyVote.vote(_policyAddress, _vote);
		address votingRsult = _policyVote.getVotingRsult(allocator());
		if (votingRsult == address(0)) {
			return;
		}
		setPolicy(votingRsult);
		address[] memory losePolicies = _policyVote.getLosePolicies();
		uint256 losePoliciesLength = losePolicies.length;
		for (uint256 i = 0; i < losePoliciesLength; i++) {
			Policy(losePolicies[i]).kill();
		}
		_policyVote = new PolicyVote();
	}
}
