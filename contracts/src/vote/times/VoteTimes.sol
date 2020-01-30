pragma solidity ^0.5.0;

import {SafeMath} from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import {Killable} from "contracts/src/common/lifecycle/Killable.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {VoteTimesStorage} from "contracts/src/vote/times/VoteTimesStorage.sol";

contract VoteTimes is UsingConfig, UsingValidator, Killable {
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

	function resetVoteTimesByProperty(address _property) external {
		addressValidator().validateAddresses(
			msg.sender,
			config().allocator(),
			config().propertyFactory()
		);

		uint256 voteTimes = getStorage().getVoteTimes();
		getStorage().setVoteTimesByProperty(_property, voteTimes);
	}

	function getAbstentionTimes(address _property)
		external
		view
		returns (uint256)
	{
		uint256 voteTimes = getStorage().getVoteTimes();
		uint256 voteTimesByProperty = getStorage().getVoteTimesByProperty(
			_property
		);
		return voteTimes.sub(voteTimesByProperty);
	}

	function getStorage() private view returns (VoteTimesStorage) {
		return VoteTimesStorage(config().voteTimesStorage());
	}
}
