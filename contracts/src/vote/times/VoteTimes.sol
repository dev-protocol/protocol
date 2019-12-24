pragma solidity ^0.5.0;

import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {AddressValidator} from "contracts/src/common/validate/AddressValidator.sol";
import {VoteTimesStorage} from "contracts/src/vote/times/VoteTimesStorage.sol";

contract VoteTimes is UsingConfig {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addVoteTime() external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().marketFactory(),
			config().policyFactory()
		);

		uint256 voteTimes = getStorage().getVoteTimes();
		voteTimes++;
		getStorage().setVoteTimes(voteTimes);
	}

	function addVoteTimesByProperty(address _property) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().voteCounter()
		);

		uint256 voteTimesByProperty = getStorage().getVoteTimesByProperty(
			_property
		);
		voteTimesByProperty++;
		getStorage().setVoteTimesByProperty(_property, voteTimesByProperty);
	}

	function resetVoteTimesByProperty(address _property) external {
		new AddressValidator().validateAddress(
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
		return voteTimes - voteTimesByProperty;
	}

	function getStorage() private view returns (VoteTimesStorage) {
		return VoteTimesStorage(config().voteTimesStorage());
	}
}
