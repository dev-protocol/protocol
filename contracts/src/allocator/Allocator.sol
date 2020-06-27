pragma solidity ^0.5.0;

import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {IAllocator} from "contracts/src/allocator/IAllocator.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {MetricsGroup} from "contracts/src/metrics/MetricsGroup.sol";
import {IWithdraw} from "contracts/src/withdraw/IWithdraw.sol";
import {Policy} from "contracts/src/policy/Policy.sol";
import {ILockup} from "contracts/src/lockup/ILockup.sol";

contract Allocator is Pausable, UsingConfig, IAllocator, UsingValidator {

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function calculateMaxRewardsPerBlock() public view returns (uint256) {
		require(paused() == false, "You cannot use that");
		uint256 totalAssets = MetricsGroup(config().metricsGroup())
			.totalIssuedMetrics();
		uint256 totalLockedUps = ILockup(config().lockup()).getAllValue();
		return Policy(config().policy()).rewards(totalLockedUps, totalAssets);
	}

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
	) external {
		require(paused() == false, "You cannot use that");
		addressValidator().validateGroup(msg.sender, config().propertyGroup());

		IWithdraw(config().withdraw()).beforeBalanceChange(
			_property,
			_from,
			_to
		);
	}
}
