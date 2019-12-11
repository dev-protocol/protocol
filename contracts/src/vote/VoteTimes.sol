pragma solidity ^0.5.0;

import "../common/config/UsingConfig.sol";
import "../common/storage/UsingStorage.sol";
import "../common/validate/AddressValidator.sol";

contract VoteTimes is UsingConfig, UsingStorage {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addVoteCount() external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().marketFactory(),
			config().policyFactory()
		);

		uint256 voteTimes = eternalStorage().getUint(keccak256("_voteTimes"));
		voteTimes++;
		eternalStorage().setUint(keccak256("_voteTimes"), voteTimes);
	}

	function addVoteTimesByProperty(address _property) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().voteCounter()
		);

		bytes32 key = keccak256(
			abi.encodePacked("_voteTimesByProperty", _property)
		);
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

		uint256 voteTimes = eternalStorage().getUint(keccak256("_voteTimes"));
		bytes32 key = keccak256(
			abi.encodePacked("_voteTimesByProperty", _property)
		);
		eternalStorage().setUint(key, voteTimes);
	}

	function getAbstentionTimes(address _property)
		external
		view
		returns (uint256)
	{
		uint256 voteTimes = eternalStorage().getUint(keccak256("_voteTimes"));
		bytes32 key = keccak256(
			abi.encodePacked("_voteTimesByProperty", _property)
		);
		uint256 voteTimesByProperty = eternalStorage().getUint(key);
		return voteTimes - voteTimesByProperty;
	}
}
