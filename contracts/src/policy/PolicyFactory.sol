pragma solidity ^0.5.0;

import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {Killable} from "contracts/src/common/lifecycle/Killable.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {VoteTimes} from "contracts/src/vote/times/VoteTimes.sol";
import {Policy} from "contracts/src/policy/Policy.sol";
import {PolicySet} from "contracts/src/policy/PolicySet.sol";
import {PolicyGroup} from "contracts/src/policy/PolicyGroup.sol";

contract PolicyFactory is Pausable, UsingConfig, UsingValidator, Killable {
	event Create(address indexed _from, address _policy, address _innerPolicy);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function create(address _newPolicyAddress) external returns (address) {
		require(paused() == false, "You cannot use that");
		addressValidator().validateIllegalAddress(_newPolicyAddress);

		Policy policy = new Policy(address(config()), _newPolicyAddress);
		address policyAddress = address(policy);
		emit Create(msg.sender, policyAddress, _newPolicyAddress);
		if (config().policy() == address(0)) {
			config().setPolicy(policyAddress);
		} else {
			VoteTimes(config().voteTimes()).addVoteTime();
		}
		PolicyGroup policyGroup = PolicyGroup(config().policyGroup());
		policyGroup.addGroup(policyAddress);
		PolicySet policySet = PolicySet(config().policySet());
		policySet.addSet(policyAddress);
		return policyAddress;
	}

	function convergePolicy(address _currentPolicyAddress) external {
		addressValidator().validateGroup(msg.sender, config().policyGroup());

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
