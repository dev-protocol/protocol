pragma solidity ^0.5.0;

import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {IPolicyGroup} from "contracts/src/policy/IPolicyGroup.sol";
import {IPolicySet} from "contracts/src/policy/IPolicySet.sol";
import {IPolicyFactory} from "contracts/src/policy/IPolicyFactory.sol";

/**
 * A factory contract that creates a new Policy contract.
 */
contract PolicyFactory is UsingConfig, UsingValidator, IPolicyFactory {
	event Create(address indexed _from, address _policy);

	/**
	 * Initialize the passed address as AddressConfig address.
	 */
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	/**
	 * Creates a new Policy contract.
	 */
	function create(address _newPolicyAddress) external {
		/**
		 * Validates the passed address is not 0 address.
		 */
		addressValidator().validateIllegalAddress(_newPolicyAddress);

		emit Create(msg.sender, _newPolicyAddress);

		/**
		 * In the case of the first Policy, it will be activated immediately.
		 */
		if (config().policy() == address(0)) {
			config().setPolicy(_newPolicyAddress);
		}

		/**
		 * Adds the created Policy contract to the Policy address set.
		 */
		IPolicyGroup policyGroup = IPolicyGroup(config().policyGroup());
		policyGroup.addGroup(_newPolicyAddress);

		/**
		 * Adds the created Policy contract to the Policy address set that is accepting votes.
		 */
		IPolicySet policySet = IPolicySet(config().policySet());
		policySet.addSet(_newPolicyAddress);

		/**
		 * When the new Policy is the first Policy, the processing ends.
		 */
		if (config().policy() == _newPolicyAddress) {
			return;
		}

		/**
		 * Resets the voting period because a new Policy has been added.
		 */
		policySet.setVotingEndBlockNumber(_newPolicyAddress);
	}

	/**
	 * Sets the Policy passed by a vote as an current Policy.
	 */
	function convergePolicy(address _currentPolicyAddress) external {
		/**
		 * Verify sender is VoteCounter contract
		 */
		addressValidator().validateAddress(msg.sender, config().voteCounter());

		/**
		 * Sets the passed Policy to current Policy.
		 */
		config().setPolicy(_currentPolicyAddress);

		/**
		 * Removes all unapproved Policies from the voting target.
		 */
		IPolicySet policySet = IPolicySet(config().policySet());
		IPolicyGroup policyGroup = IPolicyGroup(config().policyGroup());
		for (uint256 i = 0; i < policySet.count(); i++) {
			address policyAddress = policySet.get(i);
			if (policyAddress == _currentPolicyAddress) {
				continue;
			}
			policyGroup.deleteGroup(policyAddress);
		}

		/**
		 * Resets the Policy address set that is accepting votes.
		 */
		policySet.reset();
		policySet.addSet(_currentPolicyAddress);
	}
}
