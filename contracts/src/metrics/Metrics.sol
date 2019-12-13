pragma solidity ^0.5.0;

contract Metrics {
	address public market;
	address public property;

	constructor(address _property) public {
		//Do not validate because there is no AddressConfig
		market = msg.sender;
		property = _property;
	}
}
