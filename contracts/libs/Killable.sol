pragma solidity ^0.5.0;

contract Killable {
	address payable public _owner;

	constructor() internal {
		_owner = msg.sender;
	}

	function kill() public {
		require(msg.sender == _owner, "Only owner method");
		selfdestruct(_owner);
	}
}

contract KillableSender {
	address payable public _owner;

	constructor(address payable sender) internal {
		_owner = sender;
	}

	function kill() public {
		require(msg.sender == _owner, "Only owner method");
		selfdestruct(_owner);
	}
}
