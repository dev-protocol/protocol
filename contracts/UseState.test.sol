pragma solidity ^0.5.0;

import "./UseState.sol";

contract UseStateTest is UseState {
	function t_changeStateAddress(address nextState) public {
		changeStateAddress(nextState);
	}

	function t_state() public view returns (State) {
		return state();
	}

	function t_allocator() public view returns (address) {
		return allocator();
	}

	function t_addMarket(address _addr) public returns (bool) {
		return addMarket(_addr);
	}

	function t_getToken() public view returns (address) {
		return getToken();
	}

	function t_addProperty(address _prop) public {
		return addProperty(_prop);
	}

	function t_isProperty(address _addr) public view returns (bool) {
		return isProperty(_addr);
	}

	function t_addMetrics(address _metrics) internal {
		return addMetrics(_metrics);
	}

	function t_isMetrics(address _metrics) internal view returns (bool) {
		return isMetrics(_metrics);
	}
}
