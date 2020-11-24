pragma solidity 0.5.17;

import {
	ERC20Mintable
} from "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import {
	ERC20Burnable
} from "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";

/**
 * A contract to migrate two ERC20 tokens.
 * Used to migrate the legacy DEV tokens to the latest DEV tokens.
 */
contract DevMigration {
	address public legacy;
	address public next;

	/**
	 * Initialize the two passed addresses as the source and destination.
	 */
	constructor(address _legacy, address _next) public {
		legacy = _legacy;
		next = _next;
	}

	/**
	 * Migrates tokens.
	 * The steps: Transfer a sender's all balances of source tokens to this contract and then burn the same amount. Then mint the destination tokens.
	 * Notes:
	 * - Approve is required to transfer the balance of the source token.
	 * - The source tokens must be burnable.
	 * - The destination tokens must be mintable.
	 * - This contract needs permission to mint the destination tokens.
	 */
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
