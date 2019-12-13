pragma solidity ^0.5.0;

import {SafeMath} from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {AddressValidator} from "contracts/src/common/validate/AddressValidator.sol";
import {Property} from "contracts/src/property/Property.sol";
import {Lockup} from "contracts/src/lockup/Lockup.sol";
import {Allocator} from "contracts/src/allocator/Allocator.sol";
import {VoteTimes} from "contracts/src/vote/times/VoteTimes.sol";
import {VoteCounterStorage} from "contracts/src/vote/counter/VoteCounterStorage.sol";

contract VoteCounter is UsingConfig {
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addVoteCount(address _user, address _property, bool _agree)
		external
	{
		new AddressValidator().validateGroup(
			msg.sender,
			config().marketGroup(),
			config().policyGroup()
		);

		bool alreadyVote = getStorage().getAlreadyVoteFlg(
			_user,
			msg.sender,
			_property
		);
		require(alreadyVote == false, "already vote");
		uint256 voteCount = getVoteCount(_user, _property);
		require(voteCount != 0, "vote count is 0");
		getStorage().setAlreadyVoteFlg(_user, msg.sender, _property);
		if (_agree) {
			addAgreeCount(msg.sender, voteCount);
		} else {
			addOppositeCount(msg.sender, voteCount);
		}
	}

	function getAgreeCount(address _sender) external view returns (uint256) {
		return getStorage().getAgreeCount(_sender);
	}

	function getOppositeCount(address _sender) external view returns (uint256) {
		return getStorage().getOppositeCount(_sender);
	}

	function getVoteCount(address _sender, address _property)
		private
		returns (uint256)
	{
		uint256 voteCount;
		if (Property(_property).author() == _sender) {
			// solium-disable-next-line operator-whitespace
			voteCount = Lockup(config().lockup())
				.getPropertyValue(_property)
				.add(
				Allocator(config().allocator()).getRewardsAmount(_property)
			);
			VoteTimes(config().voteTimes()).addVoteTimesByProperty(_property);
		} else {
			voteCount = Lockup(config().lockup()).getValue(_property, _sender);
		}
		return voteCount;
	}

	function addAgreeCount(address _target, uint256 _voteCount) private {
		uint256 agreeCount = getStorage().getAgreeCount(_target);
		agreeCount = agreeCount.add(_voteCount);
		getStorage().setAgreeCount(_target, agreeCount);
	}

	function addOppositeCount(address _target, uint256 _voteCount) private {
		uint256 oppositeCount = getStorage().getOppositeCount(_target);
		oppositeCount = oppositeCount.add(_voteCount);
		getStorage().setAgreeCount(_target, oppositeCount);
	}

	function getStorage() private view returns (VoteCounterStorage) {
		return VoteCounterStorage(config().voteCounterStorage());
	}
}
