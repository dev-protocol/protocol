pragma solidity 0.5.17;

import {UsingRegistry} from "contracts/src/common/registry/UsingRegistry.sol";
import {IAllocator} from "contracts/interface/IAllocator.sol";
import {IWithdraw} from "contracts/interface/IWithdraw.sol";
import {IPolicy} from "contracts/interface/IPolicy.sol";
import {ILockup} from "contracts/interface/ILockup.sol";
import {IPropertyGroup} from "contracts/interface/IPropertyGroup.sol";
import {IMetricsGroup} from "contracts/interface/IMetricsGroup.sol";

/**
 * A contract that determines the total number of mint.
 * Lockup contract and Withdraw contract mint new DEV tokens based on the total number of new mint determined by this contract.
 */
contract Allocator is UsingRegistry, IAllocator {
	/**
	 * Initialize the argument as Registry address.
	 */
	constructor(address _registry) public UsingRegistry(_registry) {}

	/**
	 * Returns the maximum new mint count per block.
	 * This function gets the total number of Metrics contracts and total number of lockups and returns the calculation result of `Policy.rewards`.
	 */
	function calculateMaxRewardsPerBlock() external view returns (uint256) {
		uint256 totalAssets =
			IMetricsGroup(registry().get("MetricsGroup")).totalIssuedMetrics();
		uint256 totalLockedUps =
			ILockup(registry().get("Lockup")).getAllValue();
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
			IPropertyGroup(registry().get("PropertyGroup")).isGroup(msg.sender),
			"this is illegal address"
		);

		IWithdraw(registry().get("Withdraw")).beforeBalanceChange(
			_property,
			_from,
			_to
		);
	}
}
