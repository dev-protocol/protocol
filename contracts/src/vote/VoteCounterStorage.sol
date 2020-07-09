pragma solidity ^0.5.0;

import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";

contract VoteCounterStorage is UsingStorage {
	// Already Vote Flg
	function setStorageAlreadyVoteFlg(address _user, address _target) internal {
		bytes32 alreadyVoteKey = getStorageAlreadyVoteKey(_user, _target);
		return eternalStorage().setBool(alreadyVoteKey, true);
	}

	function getStorageAlreadyVoteFlg(address _user, address _target)
		public
		view
		returns (bool)
	{
		bytes32 alreadyVoteKey = getStorageAlreadyVoteKey(_user, _target);
		return eternalStorage().getBool(alreadyVoteKey);
	}

	function getStorageAlreadyVoteKey(address _user, address _target)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_alreadyVote", _user, _target));
	}

	// Already Vote Flg
	function setStorageAlreadyUsePropertyFlg(address _user, address _property, uint256 _votingGroupIndex) internal {
		bytes32 key = getStorageAlreadyUsePropertyKey(_user, _property, _votingGroupIndex);
		return eternalStorage().setBool(key, true);
	}

	function getStorageAlreadyUsePropertyFlg(address _user, address _property, uint256 _votingGroupIndex)
		public
		view
		returns (bool)
	{
		bytes32 key = getStorageAlreadyUsePropertyKey(_user, _property, _votingGroupIndex);
		return eternalStorage().getBool(key);
	}

	function getStorageAlreadyUsePropertyKey(address _user, address _property, uint256 _votingGroupIndex)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_alreadyUseProperty", _user, _property, _votingGroupIndex));
	}

	// Agree Count
	function setStorageAgreeCount(address _sender, uint256 count) internal {
		eternalStorage().setUint(getStorageAgreeVoteCountKey(_sender), count);
	}

	function getStorageAgreeCount(address _sender)
		public
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getStorageAgreeVoteCountKey(_sender));
	}

	function getStorageAgreeVoteCountKey(address _sender)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_sender, "_agreeVoteCount"));
	}

	// Opposite Count
	function setStorageOppositeCount(address _sender, uint256 count) internal {
		eternalStorage().setUint(
			getStorageOppositeVoteCountKey(_sender),
			count
		);
	}

	function getStorageOppositeCount(address _sender)
		public
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(getStorageOppositeVoteCountKey(_sender));
	}

	function getStorageOppositeVoteCountKey(address _sender)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_sender, "_oppositeVoteCount"));
	}
}
