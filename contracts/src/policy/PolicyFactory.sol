pragma solidity ^0.5.0;

import "../common/config/UsingConfig.sol";
import "./Policy.sol";
import "./PolicyGroup.sol";
import "../vote/VoteTimes.sol";

contract PolicyFactory is UsingConfig {
	event Create(address indexed _from, address _property);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function createPolicy(address _newPolicyAddress) public returns (address) {
		Policy policy = new Policy(address(config()), _newPolicyAddress);
		address policyAddress = address(policy);
		emit Create(msg.sender, policyAddress);
		PolicyGroup policyGroup = PolicyGroup(config().policyGroup());
		policyGroup.add(policyAddress);
		if (policyGroup.count() == 1) {
			config().setPolicy(policyAddress);
		} else {
			VoteTimes(config().voteTimes()).addVoteCount();
		}
		return policyAddress;
	}

	function convergePolicy(address _currentPolicyAddress) public {
		config().setPolicy(_currentPolicyAddress);
		PolicyGroup policyGroup = PolicyGroup(config().policyGroup());
		for (uint256 i = 0; i < policyGroup.count(); i++) {
			address policyAddress = policyGroup.get(i);
			if (policyAddress == _currentPolicyAddress) {
				continue;
			}
			Policy(policyAddress).kill();
		}
		policyGroup.deleteAll();
		policyGroup.add(_currentPolicyAddress);
	}
}
