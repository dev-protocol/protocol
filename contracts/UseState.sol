pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./State.sol";

contract UseState is Ownable {
	address private _state;

	function changeStateAddress(address nextState) public onlyOwner {
		_state = nextState;
	}

	function state() internal view returns (State) {
		return State(_state);
	}

	function getDistributor() internal view returns (address) {
		return state().getDistributor();
	}

	function getToken() internal view returns (address) {
		return state().getToken();
	}

	function getRepository(string memory package)
		internal
		view
		returns (address)
	{
		return (state().getRepository(package));
	}

	function addRepository(string memory package, address repository) internal {
		state().addRepository(package, address(repository));
	}

	function isRepository(address _addr) internal view returns (bool) {
		return state().isRepository(_addr);
	}

	function isDistributor(address _addr) public view returns (bool) {
		return state().isDistributor(_addr);
	}
}
