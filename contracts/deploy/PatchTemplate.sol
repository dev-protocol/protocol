pragma solidity 0.5.17;

import {IPatch} from "contracts/interface/IPatch.sol";
import {Allocator} from "contracts/src/allocator/Allocator.sol";

/**
 * Contracts executed from the upgrader.
 * Deploy the Dev Protocol contract and rewrite the owner.
 * Switch the contract you want to deploy as needed
 */
contract PatchTemplate is IPatch {
	address public config;
	address public upgrader;
	address public ownerble;

	/**
	 * @dev Initialize the passed address as AddressConfig address and Upgrader address.
	 * @param _config AddressConfig address.
	 * @param _upgrader Upgrader address.
	 */
	constructor(address _config, address _upgrader) public {
		config = _config;
		upgrader = _upgrader;
	}

	/**
	 * Modifiers to validate that only the Upgrader can execute.
	 */
	modifier onlyUpgrader() {
		require(msg.sender == upgrader, "illegal access");
		_;
	}

	/**
	 * @dev Deploy the Dev Protocol contract.
	 */
	function deploy() external onlyUpgrader {
		// ex) Allocator
		Allocator allocator = new Allocator(config);
		ownerble = address(allocator);
	}
}
