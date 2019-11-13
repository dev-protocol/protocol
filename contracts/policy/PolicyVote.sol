pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../Allocator.sol";
import "./Policy.sol";

contract PolicyVote {
	using SafeMath for uint256;
	mapping(address=>bool) private _existAddress;
	address[] private _targetAddresses;
	address private currentPolicy;
	address[] private tmpLosePolicies;

	function vote(address _policyAddress, uint256 _vote) public {
		//emit Vote(msg.sender, _policyAddress, _vote);
		Policy(_policyAddress).vote(_vote);
		_existAddress[_policyAddress] = true;
		_targetAddresses.push(_policyAddress);
	}

	function getVotingRsult(address allocatorAddress) public returns (address) {
		uint256 allVoteCount = Allocator(allocatorAddress).getAllVoteCount();
		// TODO
		allVoteCount = allVoteCount + 1;
		currentPolicy = address(0);
		return currentPolicy;
	}

	function getLosePolicies() public returns (address[] memory){
		require(currentPolicy != address(0), "next policy is not decided yet.");
		require(tmpLosePolicies.length == 0, "tmpLosePolicies is used.");
		uint256 arrayLength = _targetAddresses.length;
		for (uint256 i = 0; i<arrayLength; i++) {
			if (_existAddress[_targetAddresses[i]]){
				if (currentPolicy != _targetAddresses[i]){
					tmpLosePolicies.push(_targetAddresses[i]);
				}
			}
		}
		require(tmpLosePolicies.length != 0, "lost policies is not exist.");
		address[] memory losePolicies = new address[](tmpLosePolicies.length);
		losePolicies = tmpLosePolicies;
		return losePolicies;
	}

}

contract PolicyVoteProvider {
	PolicyVote private _policyVote;
	function setUp() public {
		_policyVote = new PolicyVote();
	}
	function vote(address _policyAddress, uint256 _vote) public {
		_policyVote.vote(_policyAddress, _vote);
	}

}
