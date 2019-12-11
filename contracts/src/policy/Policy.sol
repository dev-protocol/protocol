pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./IPolicy.sol";
import "../common/lifecycle/Killable.sol";
import "../vote/VoteCounter.sol";
import "../property/PropertyGroup.sol";
import "./PolicyFactory.sol";

contract Policy is Killable, UsingConfig {
	using SafeMath for uint256;
	IPolicy private _policy;
	uint256 private _votingEndBlockNumber;

	constructor(address _config, address _innerPolicyAddress)
		public
		UsingConfig(_config)
	{
		new AddressValidator().validateSender(
			msg.sender,
			config().policyFactory()
		);

		_policy = IPolicy(_innerPolicyAddress);
		setVotingEndBlockNumber();
	}

	function rewards(uint256 _lockups, uint256 _assets)
		public
		view
		returns (uint256)
	{
		return _policy.rewards(_lockups, _assets);
	}

	// TODO Need to be called in the market reward calculation process in Allocator Contract
	function holdersShare(uint256 _amount, uint256 _lockups)
		public
		view
		returns (uint256)
	{
		return _policy.holdersShare(_amount, _lockups);
	}

	function assetValue(uint256 _value, uint256 _lockups)
		public
		view
		returns (uint256)
	{
		return _policy.assetValue(_value, _lockups);
	}

	function authenticationFee(uint256 _assets, uint256 _propertyAssets)
		public
		view
		returns (uint256)
	{
		return _policy.authenticationFee(_assets, _propertyAssets);
	}

	function marketApproval(uint256 _agree, uint256 _opposite)
		public
		view
		returns (bool)
	{
		return _policy.marketApproval(_agree, _opposite);
	}

	function policyApproval(uint256 _agree, uint256 _opposite)
		public
		view
		returns (bool)
	{
		return _policy.policyApproval(_agree, _opposite);
	}

	function marketVotingBlocks() public view returns (uint256) {
		return _policy.marketVotingBlocks();
	}

	function policyVotingBlocks() public view returns (uint256) {
		return _policy.policyVotingBlocks();
	}

	function abstentionPenalty(uint256 _count) public view returns (uint256) {
		return _policy.abstentionPenalty(_count);
	}

	function lockUpBlocks() public view returns (uint256) {
		return _policy.lockUpBlocks();
	}

	function vote(address _property, bool _agree) external {
		AddressValidator validator = new AddressValidator();
		validator.validateGroup(_property, config().propertyGroup());

		require(config().policy() != address(this), "this policy is current");
		require(
			block.number <= _votingEndBlockNumber,
			"voting deadline is over"
		);
		VoteCounter voteCounter = VoteCounter(config().voteCounter());
		voteCounter.addVoteCount(msg.sender, _property, _agree);
		bool result = Policy(config().policy()).policyApproval(
			voteCounter.getAgreeCount(address(this)),
			voteCounter.getOppositeCount(address(this))
		);
		if (result == false) {
			return;
		}
		PolicyFactory(config().policyFactory()).convergePolicy(address(this));
	}

	function setVotingEndBlockNumber() private {
		if (config().policy() == address(0)) {
			return;
		}
		uint256 tmp = Policy(config().policy()).policyVotingBlocks();
		_votingEndBlockNumber = block.number + tmp;
	}
}
