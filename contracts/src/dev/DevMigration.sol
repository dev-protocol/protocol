pragma solidity ^0.6.0;

// prettier-ignore
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import {Dev} from "contracts/src/dev/Dev.sol";


contract DevMigration {
	address public legacy;
	address public next;

	constructor(address _legacy, address _next) public {
		legacy = _legacy;
		next = _next;
	}

	function migrate() external returns (bool) {
		ERC20Burnable _legacy = ERC20Burnable(legacy);
		Dev _next = Dev(next);
		uint256 balance = _legacy.balanceOf(msg.sender);
		require(
			_legacy.transferFrom(msg.sender, address(this), balance),
			"legacy dev transferFrom failed"
		);
		_legacy.burn(balance);
		_next.mint(msg.sender, balance);
		return true;
	}
}
