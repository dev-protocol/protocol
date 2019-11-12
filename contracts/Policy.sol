pragma solidity ^0.5.0;

import "./UseState.sol";

contract Policy {
	address private _owner;
	constructor(address _own) public {
		_owner = _own;
	}
}
