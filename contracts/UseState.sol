pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import './State.sol';

contract UseState is Ownable {
	address private _state;

	function changeStateAddress(address nextState) public onlyOwner {
		_state = nextState;
	}

	function state() public view returns (State) {
		return State(_state);
	}

	function getToken() public view returns (address) {
		return state().getToken();
	}

	function getRepository(string memory package) public returns (address) {
		return(state().getRepository(package));
	}

	function addRepository(string memory package, address repository) public {
		state().addRepository(package, address(repository));
	}

	function getRepositories() public view returns (address[] memory) {
		return state().getRepositories();
	}

	function getTotalBalance(address addr) public view returns (uint) {
		return state().getTotalBalance(addr);
	}
}
