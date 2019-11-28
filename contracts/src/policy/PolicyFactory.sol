pragma solidity ^0.5.0;

import "../libs/Utils.sol";
import "../config/UsingConfig.sol";
import "./Policy.sol";


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
