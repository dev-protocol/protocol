pragma solidity ^0.5.0;

import {ERC20Mintable} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import {ERC20Burnable} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

contract DevMigration {
	address public legacy;
	address public next;
	constructor(address _legacy, address _next) public {
		legacy = _legacy;
		next = _next;
	}

	function migration() public returns (bool) {
		ERC20Burnable _legacy = ERC20Burnable(legacy);
		ERC20Mintable _next = ERC20Mintable(next);
		uint256 balance = _legacy.balanceOf(msg.sender);
		_legacy.transferFrom(msg.sender, address(this), balance);
		_legacy.burn(balance);
		_next.mint(msg.sender, balance);
		return true;
	}
}
