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

	function policy() internal view returns (address) {
		return state().policy();
	}

	function setPolicy(address currentPolicyAddress) internal {
		state().setPolicy(currentPolicyAddress);
	}

	function lockup() internal view returns (address) {
		return state().lockup();
	}

	function propertyFactory() internal view returns (address) {
		return state().propertyFactory();
	}

	function propertyGroup() internal view returns (address) {
		return state().propertyGroup();
	}

	function marketFactory() internal view returns (address) {
		return state().marketFactory();
	}

	function marketGroup() internal view returns (address) {
		return state().marketGroup();
	}

	function metricsGroup() internal view returns (address) {
		return state().metricsGroup();
	}
}
