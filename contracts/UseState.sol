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

	function getSecurity(string memory package) public returns (address) {
		return(state().getSecurity(package));
	}

	function addSecurity(string memory package, address security) public {
		state().addSecurity(package, address(security));
	}

	function getSecurities() public view returns (address[] memory) {
		return state().getSecurities();
	}

	function getTotalBalance(address addr) public view returns (uint) {
		return state().getTotalBalance(addr);
	}
}
