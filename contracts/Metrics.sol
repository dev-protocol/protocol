pragma solidity ^0.5.0;

contract Metrics {
	address public market;
	address public property;

	constructor(address _property) public {
		market = msg.sender;
		property = _property;
	}
}
