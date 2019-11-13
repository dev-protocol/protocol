pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract PolicyVote {
	using SafeMath for uint256;
	mapping(address => uint256) private voteNumber;

	function vote(address policyAddress, uint256 vote) public {
		voteNumber[policyAddress] = voteNumber[policyAddress] + vote;
	}

	function votingRsult() private returns (address) {
		return address(0);
	}
}

contract PolicyVoteProvider {
	PolicyVote private policyVote;
	function setUp() public {
		policyVote = new PolicyVote();
	}
	function vote(address policyAddress, uint256 vote) public {
		policyVote.vote(policyAddress, vote);
	}

}
