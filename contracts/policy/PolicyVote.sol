pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../libs/Utils.sol";
import "../Allocator.sol";
import "./Policy.sol";

contract PolicyVote {
	using SafeMath for uint256;
	AddressSet private _targetAddresses;

	function vote(address _policyAddress, uint256 _vote) public {
		// TODO 同一userから複数回投票を受けないようにする
		Policy(_policyAddress).vote(_vote);
		_targetAddresses.add(_policyAddress);
	}

	function isVoting() public view returns (bool) {
		return _targetAddresses.length() != 0;
	}

	function getVotingRsult(address allocatorAddress) public returns (address) {
		uint256 allVoteCount = Allocator(allocatorAddress).getAllVoteCount();
		uint256 arrayLength = _targetAddresses.get().length;
		uint256[] memory votes = new uint256[](arrayLength);
		for (uint256 i = 0; i < arrayLength; i++) {
			votes[i] = Policy(_targetAddresses.get()[i]).voteCount();
		}
		uint256[] memory sortResult = new QuickSort().sort(votes);
		if (new VoteResult(allVoteCount, sortResult).isDecided()) {
			return getPolicyAddressFromVoteCount(sortResult[0]);
		}
		return address(0);
	}

	function getPolicyAddressFromVoteCount(uint256 voteCount)
		private
		view
		returns (address)
	{
		uint256 arrayLength = _targetAddresses.get().length;
		for (uint256 i = 0; i < arrayLength; i++) {
			if (voteCount == Policy(_targetAddresses.get()[i]).voteCount()) {
				return _targetAddresses.get()[i];
			}
		}
		revert("not found address.");
	}

	function getPolicyAddresses() public view returns (address[] memory) {
		return _targetAddresses.get();
	}
}

contract VoteResult {
	uint256 private _allVoteCount;
	uint256[] private _vsortedVoteCount;
	constructor(uint256 allVoteCount, uint256[] memory sortedVoteCount) public {
		_allVoteCount = allVoteCount;
		_vsortedVoteCount = sortedVoteCount;
	}
	function isDecided() public returns (bool) {
		//TODO supports more complex patterns
		uint256 remainingVoteCount = _allVoteCount -
			new MathUtils().sum(_vsortedVoteCount);
		return _vsortedVoteCount[0] > _vsortedVoteCount[1] + remainingVoteCount;
	}
}
