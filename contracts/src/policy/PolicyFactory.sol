pragma solidity 0.5.17;

import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {IPolicyGroup} from "contracts/interface/IPolicyGroup.sol";
import {IPolicyFactory} from "contracts/interface/IPolicyFactory.sol";

/**
 * A factory contract that creates a new Policy contract.
 */
contract PolicyFactory is UsingConfig, IPolicyFactory, Ownable {
	event Create(address indexed _from, address _policy);

	/**
	 * Initialize the passed address as AddressConfig address.
	 */
	constructor(address _config) public UsingConfig(_config) {}

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
		IPolicyGroup policyGroup = IPolicyGroup(config().policyGroup());
		if (config().policy() == address(0)) {
			config().setPolicy(_newPolicyAddress);
		}

		/**
		 * Adds the created Policy contract to the Policy address set.
		 */
		policyGroup.addGroup(_newPolicyAddress);
	}

	/**
	 * Set the policy to force a policy without a vote.
	 */
	function forceAttach(address _policy) external onlyOwner {
		/**
		 * Validates the passed Policy address is included the Policy address set
		 */
		require(
			IPolicyGroup(config().policyGroup()).isGroup(_policy),
			"this is illegal address"
		);
		/**
		 * Validates the voting deadline has not passed.
		 */
		IPolicyGroup policyGroup = IPolicyGroup(config().policyGroup());
		require(
			policyGroup.isDuringVotingPeriod(_policy),
			"voting deadline is over"
		);

		/**
		 * Sets the passed Policy to current Policy.
		 */
		config().setPolicy(_policy);
	}
}
