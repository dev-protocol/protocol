pragma solidity ^0.5.0;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {VoteTimesStorage} from "contracts/src/vote/times/VoteTimesStorage.sol";
import {IVoteTimes} from "contracts/src/vote/times/IVoteTimes.sol";
import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {Policy} from "contracts/src/policy/Policy.sol";

contract VoteTimes is IVoteTimes, UsingConfig, UsingValidator, Pausable {
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addVoteTime() external {
		addressValidator().validateAddresses(
			msg.sender,
			config().marketFactory(),
			config().policyFactory()
		);

		uint256 voteTimes = getStorage().getVoteTimes();
		voteTimes = voteTimes.add(1);
		getStorage().setVoteTimes(voteTimes);
	}

	function addVoteTimesByProperty(address _property) external {
		addressValidator().validateAddress(msg.sender, config().voteCounter());

		uint256 voteTimesByProperty = getStorage().getVoteTimesByProperty(
			_property
		);
		voteTimesByProperty = voteTimesByProperty.add(1);
		getStorage().setVoteTimesByProperty(_property, voteTimesByProperty);
	}

	function resetVoteTimesByProperty(address _property) public {
		addressValidator().validateAddresses(
			msg.sender,
			config().allocator(),
			config().propertyFactory()
		);

		uint256 voteTimes = getStorage().getVoteTimes();
		getStorage().setVoteTimesByProperty(_property, voteTimes);
	}

	function validateTargetPeriod(
		address _property,
		uint256 _beginBlock,
		uint256 _endBlock
	) external returns (bool) {
		addressValidator().validateAddresses(
			msg.sender,
			config().lockup(),
			config().withdraw()
		);

		require(
			abstentionPenalty(_property, _beginBlock, _endBlock),
			"outside the target period"
		);
		resetVoteTimesByProperty(_property);
		return true;
	}

	function getAbstentionTimes(address _property)
		private
		view
		returns (uint256)
	{
		uint256 voteTimes = getStorage().getVoteTimes();
		uint256 voteTimesByProperty = getStorage().getVoteTimesByProperty(
			_property
		);
		return voteTimes.sub(voteTimesByProperty);
	}

	function abstentionPenalty(
		address _property,
		uint256 _beginBlock,
		uint256 _endBlock
	) private view returns (bool) {
		uint256 abstentionCount = getAbstentionTimes(_property);
		uint256 notTargetPeriod = Policy(config().policy()).abstentionPenalty(
			abstentionCount
		);
		if (notTargetPeriod == 0) {
			return true;
		}
		uint256 notTargetBlockNumber = _beginBlock.add(notTargetPeriod);
		return notTargetBlockNumber < _endBlock;
	}

	function getStorage() private view returns (VoteTimesStorage) {
		require(paused() == false, "You cannot use that");
		return VoteTimesStorage(config().voteTimesStorage());
	}
}
