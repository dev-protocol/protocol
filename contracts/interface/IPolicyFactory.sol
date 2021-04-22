// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.17;

interface IPolicyFactory {
	function create(address _newPolicyAddress) external;

	function convergePolicy(address _currentPolicyAddress) external;

	function forceAttach(address _policy) external;
}
