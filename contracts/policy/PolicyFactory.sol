pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../libs/Killable.sol";
import "../libs/Utils.sol";
import "../property/PropertyFactory.sol";
import "../Lockup.sol";
import "./IPolicy.sol";
import "./PolicyVoteCounter.sol";

contract PolicyFactory is UsingConfig {
	AddressSet private _policySet;
	PolicyVoteCounter private _policyVoteCounter;
	event Create(address indexed _from, address _property);

	constructor(address _config) public UsingConfig(_config) {
		_policySet = new AddressSet();
		_policyVoteCounter = new PolicyVoteCounter();
	}

	function createPolicy(address _newPolicyAddress) public returns (address) {
		Policy policy = new Policy(
			address(config()),
			_newPolicyAddress,
			address(_policyVoteCounter)
		);
		address policyAddress = address(policy);
		emit Create(msg.sender, policyAddress);
		_policySet.add(policyAddress);
		if (_policySet.length() == 1) {
			config().setPolicy(policyAddress);
		} else {
			_policyVoteCounter.addPolicyVoteCount();
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
	address public voteCounterAddress;
	IPolicy private _policy;
	uint256 private _agreeCount;
	uint256 private _oppositeCount;
	uint256 private _votingEndBlockNumber;
	mapping(address => mapping(address => bool)) private _voteRecord;

	constructor(
		address _config,
		address _innerPolicyAddress,
		address _policyVoteCounter
	) public UsingConfig(_config) {
		_policy = IPolicy(_innerPolicyAddress);
		voteCounterAddress = _policyVoteCounter;
		_votingEndBlockNumber = block.number + _policy.policyVotingBlocks();
	}
	// TODO Need to be called in the market reward calculation process in Allocator Contract
	function rewards(uint256 _lockups, uint256 _assets)
		public
		returns (uint256)
	{
		return _policy.rewards(_lockups, _assets);
	}
	// TODO Need to be called in the market reward calculation process in Allocator Contract
	function holdersShare(uint256 _amount, uint256 _lockups)
		public
		returns (uint256)
	{
		return _policy.holdersShare(_amount, _lockups);
	}
	// TODO Need to be called in the market reward calculation process in Allocator Contract
	function assetValue(uint256 _value, uint256 _lockups)
		public
		returns (uint256)
	{
		return _policy.assetValue(_value, _lockups);
	}
	// TODO Need to be called authenticatedCallbackt in Market Contract
	function authenticationFee(uint256 _assets, uint256 _propertyAssets)
		public
		returns (uint256)
	{
		return _policy.authenticationFee(_assets, _propertyAssets);
	}
	// TODO Need to be called vote in Market Contract
	function marketApproval(uint256 _agree, uint256 _opposite)
		public
		returns (bool)
	{
		return _policy.marketApproval(_agree, _opposite);
	}

	function policyApproval(uint256 _agree, uint256 _opposite)
		public
		returns (bool)
	{
		return _policy.policyApproval(_agree, _opposite);
	}

	function marketVotingBlocks() public returns (uint256) {
		return _policy.marketVotingBlocks();
	}

	// TODO Need to be called allocate in Allocator Contract
	function abstentionPenalty(uint256 _count) public returns (bool) {
		return _policy.abstentionPenalty(_count);
	}

	function lockUpBlocks() public returns (uint256) {
		return _policy.lockUpBlocks();
	}

	function vote(address _propertyAddress, bool _agree) public {
		require(
			PropertyGroup(config().propertyGroup()).isProperty(
				_propertyAddress
			),
			"this address is not property contract."
		);
		require(config().policy() != address(this), "this policy is current.");
		require(
			block.number <= _votingEndBlockNumber,
			"voting deadline is over."
		);
		uint256 voteCount = Lockup(config().lockup()).getTokenValue(
			msg.sender,
			_propertyAddress
		);
		require(voteCount != 0, "vote count is 0.");
		require(_voteRecord[msg.sender][_propertyAddress], "already vote.");
		_voteRecord[msg.sender][_propertyAddress] = true;
		if (Property(_propertyAddress).author() == msg.sender) {
			PolicyVoteCounter(voteCounterAddress).addVoteCountByProperty(
				_propertyAddress
			);
		}
		if (_agree) {
			_agreeCount += voteCount;
		} else {
			_oppositeCount += voteCount;
		}
		bool result = Policy(config().policy()).policyApproval(
			_agreeCount,
			_oppositeCount
		);
		if (result == false) {
			return;
		}
		PolicyFactory(config().policyFactory()).convergePolicy(address(this));
	}
}
