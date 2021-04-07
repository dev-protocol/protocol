pragma solidity 0.5.17;

import {IRegistry} from "contracts/interface/IRegistry.sol";

/**
 * Module for using Registry contracts.
 */
contract UsingRegistry {
	address private _registry;

	/**
	 * Initialize the argument as Registry address.
	 */
	constructor(address _reg) public {
		_registry = _reg;
	}

	/**
	 * Returns the latest Registry instance.
	 */
	function registry() internal view returns (IRegistry) {
		return IRegistry(_registry);
	}

	/**
	 * Returns the latest Registry address.
	 */
	function registryAddress() external view returns (address) {
		return _registry;
	}
}
