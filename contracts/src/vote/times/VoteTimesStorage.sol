pragma solidity ^0.5.0;

import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {
	AddressValidator
} from "contracts/src/common/validate/AddressValidator.sol";

contract VoteTimesStorage is UsingStorage, UsingConfig {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	// Vote Times
	function getVoteTimes() external view returns (uint256) {
		return eternalStorage().getUint(getVoteTimesKey());
	}

	function setVoteTimes(uint256 times) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().voteTimes()
		);

		return eternalStorage().setUint(getVoteTimesKey(), times);
	}

	function getVoteTimesKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_voteTimes"));
	}

	//Vote Times By Property
	function getVoteTimesByProperty(address _property)
		external
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getVoteTimesByPropertyKey(_property));
	}

	function setVoteTimesByProperty(address _property, uint256 times) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().voteTimes()
		);

		return
			eternalStorage().setUint(
				getVoteTimesByPropertyKey(_property),
				times
			);
	}

	function getVoteTimesByPropertyKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_voteTimesByProperty", _property));
	}
}
