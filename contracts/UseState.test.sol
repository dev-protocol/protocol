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

	function t_getToken() public view returns (address) {
		return getToken();
	}
}
