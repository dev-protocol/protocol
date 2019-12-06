pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/config/UsingConfig.sol";
import "../common/storage/UsingStorage.sol";
import "../property/Property.sol";
import "../lockup/LockupPropertyValue.sol";
import "../lockup/LockupValue.sol";
import "../allocator/Allocation.sol";
import "./VoteTimes.sol";

contract VoteCounter is UsingConfig, UsingStorage {
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addVoteCount(
		address _sender,
		address _target,
		address _property,
		bool _agree
	) external {
		bytes32 alreadyVoteKey = getAlreadyVoteKey(_sender, _target, _property);
		bool alreadyVote = eternalStorage().getBool(alreadyVoteKey);
		require(alreadyVote == false, "already vote");
		uint256 voteCount = 0;
		if (Property(_property).author() == _sender) {
			// solium-disable-next-line operator-whitespace
			voteCount = LockupPropertyValue(config().lockupPropertyValue())
				.get(_property)
				.add(
				Allocation(config().allocation()).getRewardsAmount(_property)
			);
			VoteTimes(config().voteTimes()).addVoteTimesByProperty(_property);
		} else {
			voteCount = LockupValue(config().lockupValue()).get(
				_property,
				_sender
			);
		}
		require(voteCount != 0, "vote count is 0");
		eternalStorage().setBool(alreadyVoteKey, true);
		if (_agree) {
			addAgreeCount(_target, voteCount);
		} else {
			addOppositeCount(_target, voteCount);
		}
	}

	function addOppositeCount(address _target, uint256 _voteCount) private {
		uint256 oppositeCount = eternalStorage().getUint(
			getOppositeVoteCountKey(_target)
		);
		oppositeCount = oppositeCount.add(_voteCount);
		eternalStorage().setUint(
			getOppositeVoteCountKey(_target),
			oppositeCount
		);
	}

	function getOppositeCount(address _sender) external view returns (uint256) {
		return eternalStorage().getUint(getOppositeVoteCountKey(_sender));
	}

	function addAgreeCount(address _target, uint256 _voteCount) private {
		uint256 agreeCount = eternalStorage().getUint(
			getAgreeVoteCountKey(_target)
		);
		agreeCount = agreeCount.add(_voteCount);
		eternalStorage().setUint(getAgreeVoteCountKey(_target), agreeCount);
	}

	function getAgreeCount(address _sender) external view returns (uint256) {
		return eternalStorage().getUint(getAgreeVoteCountKey(_sender));
	}

	function getAlreadyVoteKey(
		address _sender,
		address _target,
		address _property
	) private pure returns (bytes32) {
		return keccak256(abi.encodePacked(_sender, _target, _property));
	}
	function getAgreeVoteCountKey(address _sender)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_sender, "_agreeVoteCount"));
	}
	function getOppositeVoteCountKey(address _sender)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_sender, "_oppositeVoteCount"));
	}
}
