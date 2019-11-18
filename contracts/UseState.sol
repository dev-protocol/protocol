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

	function getToken() internal view returns (address) {
		return state().getToken();
	}

	function addProperty(address _prop) internal {
		state().addProperty(_prop);
	}

	function isProperty(address _addr) internal view returns (bool) {
		return state().isProperty(_addr);
	}

	function addMetrics(address _metrics) internal {
		state().addMetrics(_metrics);
	}

	function isMetrics(address _metrics) internal view returns (bool) {
		return state().isMetrics(_metrics);
	}

	function policy() internal view returns (address) {
		return state().policy();
	}

	function setPolicy(address currentPolicyAddress) internal {
		state().setPolicy(currentPolicyAddress);
	}

	function lockup() internal view returns (address) {
		return state().lockup();
	}
}
