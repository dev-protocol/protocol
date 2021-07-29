// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface IPolicyFactory {
	function create(address _newPolicyAddress) external;

	function forceAttach(address _policy) external;
}
