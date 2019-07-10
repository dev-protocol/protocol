pragma solidity ^0.5.0;

import "./UseState.sol";

contract UseStateTest is UseState {
	function t_changeStateAddress(address nextState) public {
		changeStateAddress(nextState);
	}

	function t_state() public view returns (State) {
		return state();
	}

	function t_getToken() public view returns (address) {
		return getToken();
	}

	function t_getRepository(string memory package)
		public
		view
		returns (address)
	{
		return getRepository(package);
	}

	function t_addRepository(string memory package, address repository) public {
		addRepository(package, address(repository));
	}

    function t_getDistributor() public view returns (address) {
		return state().distributor();
	}

}
