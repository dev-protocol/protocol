pragma solidity ^0.5.0;

import "contracts/src/common/config/UsingConfig.sol";
import "contracts/src/common/storage/UsingStorage.sol";

contract VoteTimes is UsingConfig, UsingStorage {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addVoteCount() external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().marketFactory(),
			config().policyFactory()
		);

		uint256 voteTimes = eternalStorage().getUint(getVoteTimesKey());
		voteTimes++;
		eternalStorage().setUint(getVoteTimesKey(), voteTimes);
	}

	function addVoteTimesByProperty(address _property) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().voteCounter()
		);

		bytes32 key = getVoteTimesByPropertyKey(_property);
		uint256 voteTimesByProperty = eternalStorage().getUint(key);
		voteTimesByProperty++;
		eternalStorage().setUint(key, voteTimesByProperty);
	}

	function resetVoteTimesByProperty(address _property) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator(),
			config().propertyFactory()
		);

		uint256 voteTimes = eternalStorage().getUint(getVoteTimesKey());
		bytes32 key = getVoteTimesByPropertyKey(_property);
		eternalStorage().setUint(key, voteTimes);
	}

	function getAbstentionTimes(address _property)
		external
		view
		returns (uint256)
	{
		uint256 voteTimes = eternalStorage().getUint(getVoteTimesKey());
		bytes32 key = getVoteTimesByPropertyKey(_property);
		uint256 voteTimesByProperty = eternalStorage().getUint(key);
		return voteTimes - voteTimesByProperty;
	}

	function getVoteTimesKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_voteTimes"));
	}

	function getVoteTimesByPropertyKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_voteTimesByProperty", _property));
	}
}
