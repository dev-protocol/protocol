pragma solidity ^0.5.0;

import "../common/config/UsingConfig.sol";
import "../property/Property.sol";
import "../lockup/LockupPropertyValue.sol";
import "../lockup/LockupValue.sol";
import "../allocator/Allocation.sol";
import "./VoteTimes.sol";

contract VoteCounter is UsingConfig {
	uint256 public agreeCount;
	uint256 public oppositeCount;
	mapping(address => mapping(address => bool)) private _voteRecord;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addVoteCount(address _sender, address _property, bool _agree)
		public
	{
		require(_voteRecord[_sender][_property] == false, "already vote");
		uint256 voteCount = 0;
		if (Property(_property).author() == _sender) {
			// solium-disable-next-line operator-whitespace
			voteCount =
				LockupPropertyValue(config().lockupPropertyValue()).get(
					_property
				) +
				Allocation(config().allocation()).getRewardsAmount(_property);
			VoteTimes(config().voteTimes()).addVoteTimesByProperty(_property);
		} else {
			voteCount = LockupValue(config().lockupValue()).get(
				_property,
				_sender
			);
		}
		require(voteCount != 0, "vote count is 0");
		_voteRecord[_sender][_property] = true;
		if (_agree) {
			agreeCount += voteCount;
		} else {
			oppositeCount += voteCount;
		}
	}
}
