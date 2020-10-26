pragma solidity 0.5.17;

import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {ILockup} from "contracts/src/lockup/ILockup.sol";
import {ILink} from "contracts/src/link/ILink.sol";

/**
 * This contract is an interface for calls from other systems
 */
contract Link is UsingConfig, ILink {
	/**
	 * Initialize the passed address as AddressConfig address.
	 */
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	/**
	 * Call the lockup contract's getStorageLastCumulativeInterestPriceLink function.
	 */
	function getStorageLastCumulativeInterestPrice()
		external
		view
		returns (uint256)
	{
		ILockup lockup = ILockup(config().lockup());
		return lockup.getStorageLastCumulativeInterestPriceLink();
	}
}
