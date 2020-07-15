pragma solidity ^0.5.0;

import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {Policy} from "contracts/src/policy/Policy.sol";
import {IPolicyGroup} from "contracts/src/policy/IPolicyGroup.sol";
import {IPolicySet} from "contracts/src/policy/IPolicySet.sol";
import {IPolicyFactory} from "contracts/src/policy/IPolicyFactory.sol";

contract PolicyFactory is
	UsingConfig,
	UsingValidator,
	IPolicyFactory
{
	event Create(address indexed _from, address _policy, address _innerPolicy);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function create(address _newPolicyAddress) external returns (address) {
		addressValidator().validateIllegalAddress(_newPolicyAddress);

		Policy policy = new Policy(address(config()), _newPolicyAddress);
		address policyAddress = address(policy);
		emit Create(msg.sender, policyAddress, _newPolicyAddress);
		if (config().policy() == address(0)) {
			config().setPolicy(policyAddress);
		}
		IPolicyGroup policyGroup = IPolicyGroup(config().policyGroup());
		policyGroup.addGroup(policyAddress);
		IPolicySet policySet = IPolicySet(config().policySet());
		policySet.addSet(policyAddress);
		return policyAddress;
	}

	function convergePolicy(address _currentPolicyAddress) external {
		addressValidator().validateAddress(msg.sender, config().voteCounter());

		config().setPolicy(_currentPolicyAddress);
		IPolicySet policySet = IPolicySet(config().policySet());
		IPolicyGroup policyGroup = IPolicyGroup(config().policyGroup());
		for (uint256 i = 0; i < policySet.count(); i++) {
			address policyAddress = policySet.get(i);
			if (policyAddress == _currentPolicyAddress) {
				continue;
			}
			Policy(policyAddress).kill();
			policyGroup.deleteGroup(policyAddress);
		}
		policySet.reset();
		policySet.addSet(_currentPolicyAddress);
	}

	function getVotingGroupIndex() external view returns (uint256) {
		IPolicySet policySet = IPolicySet(config().policySet());
		return policySet.getVotingGroupIndex();
	}
}
