pragma solidity ^0.5.0;

import "./Policy.sol";

contract PolicyFactory is UseState {
	event Create(address indexed _from, address _property);

	function createPolicy() public returns (address) {
		Policy policy = new Policy(msg.sender);
		addProperty(address(policy));
		emit Create(msg.sender, address(policy));
		return address(policy);
	}
}
