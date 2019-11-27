pragma solidity >=0.4.25 <0.6.0;

import "./config/UsingConfig.sol";
import "./property/Property.sol";
import "./Lockup.sol";
import "./Allocator.sol";

contract Vote is UsingConfig{
	uint256 public agreeCount;
	uint256 public oppositeCount;
	mapping(address => mapping(address => bool)) private _voteRecord;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addVoteCount(address _sender, address _property, bool _agree) public {
		require(_voteRecord[_sender][_property], "already vote");
		uint256 voteCount = 0;
		if (Property(_property).author() == _sender) {
			voteCount = Lockup(config().lockup()).getTokenValueByProperty(
					_property
				) +
				Allocator(config().allocator()).getRewardsAmount(
					_property
				);
		} else {
			voteCount = Lockup(config().lockup()).getTokenValue(
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


contract VoteCounter {
	uint256 private _voteCount;
	mapping(address => uint256) private _voteCountByProperty;
	function addVoteCount() public {
		_voteCount++;
	}
	function addVoteCountByProperty(address _property) public {
		_voteCountByProperty[_property]++;
	}
	function resetVoteCountByProperty(address _property) public {
		_voteCountByProperty[_property] = _voteCount;
	}
	function getAbstentionCount(address _property)
		public
		view
		returns (uint256)
	{
		return _voteCount - _voteCountByProperty[_property];
	}
}
