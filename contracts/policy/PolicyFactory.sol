pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../libs/Killable.sol";
import "../libs/Utils.sol";
import "../UseState.sol";
import "./IPolicy.sol";
import "./PolicyVote.sol";

contract PolicyFactory is UseState {
	AddressSet private _policySet;
	event Create(address indexed _from, address _property);

	constructor() public {
		_policySet = new AddressSet();
	}

	function createPolicy(address _newPolicyAddress) public returns (address) {
		Policy policy = new Policy(address(this), _newPolicyAddress);
		address policyAddress = address(policy);
		emit Create(msg.sender, policyAddress);
		_policySet.add(policyAddress);
		if (_policySet.length() == 1){
			setPolicy(policyAddress);
		}
		return policyAddress;
	}

	function killLosePolicy(address _currentPolicyAddress) public {
		for (uint i = 0; i < _policySet.length(); i++) {
			address policyAddress = _policySet.get()[i];
			if (policyAddress == _currentPolicyAddress){
				continue;
			}
			Policy(policyAddress).kill();
		}
		_policySet = new AddressSet();
		_policySet.add(_currentPolicyAddress);
	}
}

contract Policy is Killable, UseState {
	using SafeMath for uint256;
	address private _factoryAddress;
	IPolicy private _innerPolicy;
	PolicyVoteValidator private _validator;
	uint256 private _agreeCount;
	uint256 private _oppositeCount;

	constructor(address _factory, address _innerPolicyAddress)
		public
	{
		_factoryAddress = _factory;
		_innerPolicy = IPolicy(_innerPolicyAddress);
		_validator = new PolicyVoteValidator();
	}
	function rewards(uint256 _lockups, uint256 _assets)
		public
		view
		returns (uint256)
	{
		return _innerPolicy.rewards(_lockups, _assets);
	}

	function holdersShare(uint256 _amount, uint256 _lockups)
		public
		view
		returns (uint256)
	{
		return _innerPolicy.holdersShare(_amount, _lockups);
	}

	function assetValue(uint256 _value, uint256 _lockups)
		public
		view
		returns (uint256)
	{
		return _innerPolicy.assetValue(_value, _lockups);
	}

	function authenticationFee(uint256 _assets, uint256 _propertyAssets)
		public
		view
		returns (uint256)
	{
		return _innerPolicy.authenticationFee(_assets, _propertyAssets);
	}

	function marketApproval(uint256 _agree, uint256 _opposite)
		public
		view
		returns (bool)
	{
		return _innerPolicy.marketApproval(_agree, _opposite);
	}

	function marketVotingBlocks() public view returns (uint256) {
		return _innerPolicy.marketVotingBlocks();
	}

	function policyVotingBlocks() public view returns (uint256) {
		return _innerPolicy.policyVotingBlocks();
	}

	function abstentionPenalty(uint256 count) public view returns (bool) {
		return _innerPolicy.abstentionPenalty(count);
	}

	function lockUpBlocks() public view returns (uint256) {
		return _innerPolicy.lockUpBlocks();
	}

	function vote(address _propertyAddress, bool _agree) public {
		require(policy() != address(this), "this policy is current.");
		_validator.validate(msg.sender, _propertyAddress);
		// uint voteCount =
		if (_agree) {
			_agreeCount += _agree;
		}else{
			_oppositeCount += _opposite;
		}
		bool result = _innerPolicy.policyApproval(_agreeCount, _oppositeCount);
		if (result == false){
			return;
		}
		setPolicy(address(this));
		PolicyFactory(_factoryAddress).killLosePolicy(address(this));
	}
}
