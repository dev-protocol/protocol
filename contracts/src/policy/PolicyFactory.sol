pragma solidity ^0.5.0;

import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {AddressValidator} from "contracts/src/common/validate/AddressValidator.sol";
import {VoteTimes} from "contracts/src/vote/times/VoteTimes.sol";
import {Policy} from "contracts/src/policy/Policy.sol";
import {PolicySet} from "contracts/src/policy/PolicySet.sol";
import {PolicyGroup} from "contracts/src/policy/PolicyGroup.sol";

contract PolicyFactory is UsingConfig {
	event Create(address indexed _from, address _property);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function createPolicy(address _newPolicyAddress)
		external
		returns (address)
	{
		new AddressValidator().validateDefault(_newPolicyAddress);

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

	function convergePolicy(address _currentPolicyAddress) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().policyGroup()
		);

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
