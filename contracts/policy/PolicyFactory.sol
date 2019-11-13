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
		return policyAddress;
	}

	function vote(address _policyAddress, uint256 _vote) public {
		_policyVote.vote(_policyAddress, _vote);
		address votingRsult = _policyVote.getVotingRsult(allocator());
		if (votingRsult == address(0)) {
			return;
		} else {
			setPolicy(votingRsult);
			_policyVote = new PolicyVote();
		}
	}

	function killPolicy(address _policyAddress) private {
		Policy(_policyAddress).kill();
	}
}
// TODO
//投票者が新しいコントラクトを承認する仕組み
//アクティブなポリシーは常に一つ
//古いポリシーは参照されない
