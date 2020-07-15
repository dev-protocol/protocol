pragma solidity ^0.5.0;

import {IAllocator} from "contracts/src/allocator/IAllocator.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {IMetricsGroup} from "contracts/src/metrics/IMetricsGroup.sol";
import {IWithdraw} from "contracts/src/withdraw/IWithdraw.sol";
import {Policy} from "contracts/src/policy/Policy.sol";
import {ILockup} from "contracts/src/lockup/ILockup.sol";

contract Allocator is UsingConfig, IAllocator, UsingValidator {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function calculateMaxRewardsPerBlock() public view returns (uint256) {
		uint256 totalAssets = IMetricsGroup(config().metricsGroup())
			.totalIssuedMetrics();
		uint256 totalLockedUps = ILockup(config().lockup()).getAllValue();
		return Policy(config().policy()).rewards(totalLockedUps, totalAssets);
	}

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
	) external {
		addressValidator().validateGroup(msg.sender, config().propertyGroup());

		IWithdraw(config().withdraw()).beforeBalanceChange(
			_property,
			_from,
			_to
		);
	}
}
