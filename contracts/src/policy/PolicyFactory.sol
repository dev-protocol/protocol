pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../libs/Killable.sol";
import "../libs/Utils.sol";
import "../property/PropertyFactory.sol";
import "../vote/VoteCounter.sol";
import "../Lockup.sol";
import "../Allocator.sol";
import "./IPolicy.sol";

contract PolicyFactory is UsingConfig {
	AddressSet private _policySet;
	event Create(address indexed _from, address _property);

	constructor(address _config) public UsingConfig(_config) {
		_policySet = new AddressSet();
	}

	function createPolicy(address _newPolicyAddress) public returns (address) {
		Policy policy = new Policy(address(config()), _newPolicyAddress);
		address policyAddress = address(policy);
		emit Create(msg.sender, policyAddress);
		_policySet.add(policyAddress);
		if (_policySet.length() == 1) {
			config().setPolicy(policyAddress);
		} else {
			VoteTimes(config().voteTimes()).addVoteCount();
		}
		return policyAddress;
	}

	function convergePolicy(address _currentPolicyAddress) public {
		config().setPolicy(_currentPolicyAddress);
		for (uint256 i = 0; i < _policySet.length(); i++) {
			address policyAddress = _policySet.get()[i];
			if (policyAddress == _currentPolicyAddress) {
				continue;
			}
			Policy(policyAddress).kill();
		}
		_policySet = new AddressSet();
		_policySet.add(_currentPolicyAddress);
	}
}

contract Policy is Killable, UsingConfig {
	using SafeMath for uint256;
	IPolicy private _policy;
	uint256 private _votingEndBlockNumber;
	VoteCounter private _voteCounter;

	constructor(address _config, address _innerPolicyAddress)
		public
		UsingConfig(_config)
	{
		_voteCounter = new VoteCounter(_config);
		_policy = IPolicy(_innerPolicyAddress);
		setVotingEndBlockNumber();
	}

	function setVotingEndBlockNumber() private {
		if (config().policy() == address(0)) {
			return;
		}
		uint256 policyVotingBlocks = Policy(config().policy())
			.policyVotingBlocks();
		_votingEndBlockNumber = block.number + policyVotingBlocks;
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

	function vote(address _property, bool _agree) public {
		require(
			PropertyGroup(config().propertyGroup()).isProperty(_property),
			"this address is not property contract"
		);
		require(config().policy() != address(this), "this policy is current");
		require(
			block.number <= _votingEndBlockNumber,
			"voting deadline is over"
		);
		_voteCounter.addVoteCount(msg.sender, _property, _agree);
		bool result = Policy(config().policy()).policyApproval(
			_voteCounter.agreeCount(),
			_voteCounter.oppositeCount()
		);
		if (result == false) {
			return;
		}
		PolicyFactory(config().policyFactory()).convergePolicy(address(this));
	}
}
