pragma solidity 0.5.17;

import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {ILockup} from "contracts/src/lockup/ILockup.sol";
import {ILink} from "contracts/src/link/ILink.sol";
import {Dev} from "contracts/src/dev/Dev.sol";

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
	 * Lockup
	 */
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

	function cancel(address _property) external {
		ILockup lockup = ILockup(config().lockup());
		lockup.cancel(_property);
	}

	function withdraw(address _property) external {
		ILockup lockup = ILockup(config().lockup());
		lockup.withdraw(_property);
	}

	/**
	 * Dev
	 */
	function getTokenAddress() external view returns (address) {
		return config().token();
	}

	function depositFrom(
		address _from,
		address _to,
		uint256 _amount
	) external returns (bool) {
		return Dev(config().token()).depositFrom(_from, _to, _amount);
	}
}
