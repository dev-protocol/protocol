pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../Allocator.sol";
import "./Policy.sol";

contract PolicyVote {
	using SafeMath for uint256;
	mapping(address => bool) private _existAddress;
	address[] private _targetAddresses;
	address private _currentPolicy;
	address[] private _tmpLosePolicies;

	function vote(address _policyAddress, uint256 _vote) public {
		// TODO 同一userから複数回投票を受けないようにする
		Policy(_policyAddress).vote(_vote);
		if (_existAddress[_policyAddress]) {
			return;
		}
		_existAddress[_policyAddress] = true;
		_targetAddresses.push(_policyAddress);
	}

	function isVoting() public view returns (bool) {
		return _targetAddresses.length != 0;
	}

	function getVotingRsult(address allocatorAddress) public returns (address) {
		uint256 allVoteCount = Allocator(allocatorAddress).getAllVoteCount();
		// TODO
		// 投票された結果をみて当選確実かどうかを判定する
		allVoteCount = allVoteCount + 1;
		_currentPolicy = address(0);
		return _currentPolicy;
	}

	function getLosePolicies() public returns (address[] memory) {
		require(
			_currentPolicy != address(0),
			"next policy is not decided yet."
		);
		require(_tmpLosePolicies.length == 0, "_tmpLosePolicies is used.");
		uint256 arrayLength = _targetAddresses.length;
		for (uint256 i = 0; i < arrayLength; i++) {
			if (_existAddress[_targetAddresses[i]]) {
				if (_currentPolicy != _targetAddresses[i]) {
					_tmpLosePolicies.push(_targetAddresses[i]);
				}
			}
		}
		require(_tmpLosePolicies.length != 0, "lost policies is not exist.");
		address[] memory losePolicies = new address[](_tmpLosePolicies.length);
		losePolicies = _tmpLosePolicies;
		return losePolicies;
	}
}
