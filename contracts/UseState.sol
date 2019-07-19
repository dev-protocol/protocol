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

	function allocator() internal view returns (address) {
		return state().allocator();
	}

	function addMarket(address _addr) internal returns (bool) {
		return state().addMarket(_addr);
	}

	function getToken() internal view returns (address) {
		return state().getToken();
	}

	function addProperty(string memory _id, address _prop) internal {
		state().addProperty(_id, _prop);
	}

	function getProperty(string memory _id) internal view returns (address) {
		return state().getProperty(_id);
	}

	function isProperty(address _addr) internal view returns (bool) {
		return state().isProperty(_addr);
	}
}
