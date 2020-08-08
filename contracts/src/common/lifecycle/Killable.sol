pragma solidity ^0.5.0;

/**
 * A module that allows contracts to self-destruct.
 */
contract Killable {
	address payable public _owner;

	/**
	 * Initialized with the deployer as the owner.
	 */
	constructor() internal {
		_owner = msg.sender;
	}

	/**
	 * Self-destruct the contract.
	 * This function can only be executed by the owner.
	 */
	function kill() public {
		require(msg.sender == _owner, "only owner method");
		selfdestruct(_owner);
	}
}
