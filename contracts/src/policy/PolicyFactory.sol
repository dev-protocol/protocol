pragma solidity ^0.5.0;

import "../common/config/UsingConfig.sol";
import "../common/validate/AddressValidator.sol";
import "./Policy.sol";
import "./PolicySet.sol";
import "./PolicyGroup.sol";
import "../vote/VoteTimes.sol";

contract PolicyFactory is UsingConfig {
	event Create(address indexed _from, address _property);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function createPolicy(address _newPolicyAddress) public returns (address) {
		AddressValidator validator = new AddressValidator();
		validator.validateDefault(_newPolicyAddress);

		Policy policy = new Policy(address(config()), _newPolicyAddress);
		address policyAddress = address(policy);
		emit Create(msg.sender, policyAddress);
		PolicySet policySet = PolicySet(config().policySet());
		policySet.addSet(policyAddress);
		if (policySet.count() == 1) {
			config().setPolicy(policyAddress);
		} else {
			VoteTimes(config().voteTimes()).addVoteCount();
		}
		PolicyGroup policyGroup = PolicyGroup(config().policyGroup());
		policyGroup.addGroup(policyAddress);
		return policyAddress;
	}

	function convergePolicy(address _currentPolicyAddress) public {
		AddressValidator validator = new AddressValidator();
		validator.validateGroup(_currentPolicyAddress, config().policyGroup());
		validator.validateSender(msg.sender, config().policyGroup());

		config().setPolicy(_currentPolicyAddress);
		PolicySet policySet = PolicySet(config().policySet());
		PolicyGroup policyGroup = PolicyGroup(config().policyGroup());
		for (uint256 i = 0; i < policySet.count(); i++) {
			address policyAddress = policySet.get(i);
			if (policyAddress == _currentPolicyAddress) {
				continue;
			}
			Policy(policyAddress).kill();
			policyGroup.deleteGroup(policyAddress);
		}
		policySet.deleteAll();
		policySet.addSet(_currentPolicyAddress);
	}
}
