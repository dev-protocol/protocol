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

	function t_addProperty(string memory _id, address _prop) public {
		return addProperty(_id, _prop);
	}

	function t_getProperty(string memory _id) public view returns (address) {
		return getProperty(_id);
	}

	function t_isProperty(address _addr) public view returns (bool) {
		return isProperty(_addr);
	}
}
