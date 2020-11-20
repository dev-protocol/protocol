pragma solidity 0.5.17;

import {IAllocator} from "contracts/interface/IAllocator.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {IWithdraw} from "contracts/src/withdraw/IWithdraw.sol";
import {IPolicy} from "contracts/src/policy/IPolicy.sol";
import {ILockup} from "contracts/src/lockup/ILockup.sol";
import {IPropertyGroup} from "contracts/interface/IPropertyGroup.sol";
import {IMetricsGroup} from "contracts/interface/IMetricsGroup.sol";

/**
 * A contract that determines the total number of mint.
 * Lockup contract and Withdraw contract mint new DEV tokens based on the total number of new mint determined by this contract.
 */
contract Allocator is UsingConfig, IAllocator {
	/**
	 * Initialize the argument as AddressConfig address.
	 */
	constructor(address _config) public UsingConfig(_config) {}

	/**
	 * Returns the maximum new mint count per block.
	 * This function gets the total number of Metrics contracts and total number of lockups and returns the calculation result of `Policy.rewards`.
	 */
	function calculateMaxRewardsPerBlock() external view returns (uint256) {
		uint256 totalAssets =
			IMetricsGroup(config().metricsGroup()).totalIssuedMetrics();
		uint256 totalLockedUps = ILockup(config().lockup()).getAllValue();
		return IPolicy(config().policy()).rewards(totalLockedUps, totalAssets);
	}

	/**
	 * Passthrough to `Withdraw.beforeBalanceChange` funtion.
	 * This function just passthrough function.
	 * Cannot be deleted because there are existing contracts that does not directly execute `Withdraw.beforeBalanceChange` function.
	 */
	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
	) external {
		require(
			IPropertyGroup(config().propertyGroup()).isGroup(msg.sender),
			"this is illegal address"
		);

		IWithdraw(config().withdraw()).beforeBalanceChange(
			_property,
			_from,
			_to
		);
	}
}
