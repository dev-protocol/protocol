pragma solidity ^0.5.0;

import {Killable} from "contracts/src/common/lifecycle/Killable.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";

contract VoteCounterStorage is UsingStorage, UsingConfig, UsingValidator, Killable {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	// Already Vote Flg
	function setAlreadyVoteFlg(
		address _user,
		address _sender,
		address _property
	) external {
		addressValidator().validateAddress(msg.sender, config().voteCounter());

		bytes32 alreadyVoteKey = getAlreadyVoteKey(_user, _sender, _property);
		return eternalStorage().setBool(alreadyVoteKey, true);
	}

	function getAlreadyVoteFlg(
		address _user,
		address _sender,
		address _property
	) external view returns (bool) {
		bytes32 alreadyVoteKey = getAlreadyVoteKey(_user, _sender, _property);
		return eternalStorage().getBool(alreadyVoteKey);
	}
	function getAlreadyVoteKey(
		address _sender,
		address _target,
		address _property
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked("_alreadyVote", _sender, _target, _property)
			);
	}

	// Agree Count
	function getAgreeCount(address _sender) external view returns (uint256) {
		return eternalStorage().getUint(getAgreeVoteCountKey(_sender));
	}

	function setAgreeCount(address _sender, uint256 count)
		external
		returns (uint256)
	{
		addressValidator().validateAddress(msg.sender, config().voteCounter());

		eternalStorage().setUint(getAgreeVoteCountKey(_sender), count);
	}

	function getAgreeVoteCountKey(address _sender)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_sender, "_agreeVoteCount"));
	}

	// Opposite Count
	function getOppositeCount(address _sender) external view returns (uint256) {
		return eternalStorage().getUint(getOppositeVoteCountKey(_sender));
	}

	function setOppositeCount(address _sender, uint256 count)
		external
		returns (uint256)
	{
		addressValidator().validateAddress(msg.sender, config().voteCounter());

		eternalStorage().setUint(getOppositeVoteCountKey(_sender), count);
	}

	function getOppositeVoteCountKey(address _sender)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_sender, "_oppositeVoteCount"));
	}
}
