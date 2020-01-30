pragma solidity ^0.5.0;

// prettier-ignore
import {ERC20Mintable} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
// prettier-ignore
import {ERC20Burnable} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

contract DevMigration {
	address public legacy;
	address public next;
	constructor(address _legacy, address _next) public {
		legacy = _legacy;
		next = _next;
	}

	function migrate() external returns (bool) {
		ERC20Burnable _legacy = ERC20Burnable(legacy);
		ERC20Mintable _next = ERC20Mintable(next);
		uint256 balance = _legacy.balanceOf(msg.sender);
		require(
			_legacy.transferFrom(msg.sender, address(this), balance),
			"legacy dev transferFrom failed"
		);
		_legacy.burn(balance);
		require(_next.mint(msg.sender, balance), "next dev mint failed");
		return true;
	}
}
