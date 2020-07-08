pragma solidity ^0.5.0;

contract IPolicyFactory {
	function create(address _newPolicyAddress) external returns (address);

	function convergePolicy(address _currentPolicyAddress) external;
}
