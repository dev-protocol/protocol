pragma solidity 0.5.17;

import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {UsingRegistry} from "contracts/src/common/registry/UsingRegistry.sol";
import {IPolicyGroup} from "contracts/interface/IPolicyGroup.sol";
import {IPolicyFactory} from "contracts/interface/IPolicyFactory.sol";

/**
 * A factory contract that creates a new Policy contract.
 */
contract PolicyFactory is UsingRegistry, IPolicyFactory, Ownable {
	event Create(address indexed _from, address _policy);

	/**
	 * Initialize the passed address as AddressConfig address.
	 */
	constructor(address _registry) public UsingRegistry(_registry) {}

	/**
	 * Creates a new Policy contract.
	 */
	function create(address _newPolicyAddress) external {
		/**
		 * Validates the passed address is not 0 address.
		 */
		require(_newPolicyAddress != address(0), "this is illegal address");

		emit Create(msg.sender, _newPolicyAddress);

		/**
		 * In the case of the first Policy, it will be activated immediately.
		 */
		IPolicyGroup policyGroup = IPolicyGroup(registry().get("PolicyGroup"));
		if (registry().get("Policy") == address(0)) {
			registry().set("Policy", _newPolicyAddress);
			policyGroup.addGroupWithoutSetVotingEnd(_newPolicyAddress);
			return;
		}

		/**
		 * Adds the created Policy contract to the Policy address set.
		 */
		policyGroup.addGroup(_newPolicyAddress);
	}

	/**
	 * Sets the Policy passed by a vote as an current Policy.
	 */
	function convergePolicy(address _currentPolicyAddress) external {
		/**
		 * Verify sender is VoteCounter contract
		 */
		require(
			msg.sender == registry().get("VoteCounter"),
			"this is illegal address"
		);

		setPolicy(_currentPolicyAddress);
	}

	/**
	 * Set the policy to force a policy without a vote.
	 */
	function forceAttach(address _policy) external onlyOwner {
		/**
		 * Validates the passed Policy address is included the Policy address set
		 */
		require(
			IPolicyGroup(registry().get("PolicyGroup")).isGroup(_policy),
			"this is illegal address"
		);

		setPolicy(_policy);
	}

	/**
	 * Sets the Policy
	 */
	function setPolicy(address _policy) private {
		/**
		 * Sets the passed Policy to current Policy.
		 */
		registry().set("Policy", _policy);

		/**
		 * Resets the Policy address set that is accepting votes.
		 */
		IPolicyGroup policyGroup = IPolicyGroup(registry().get("PolicyGroup"));
		policyGroup.incrementVotingGroupIndex();
		policyGroup.addGroup(_policy);
	}
}
