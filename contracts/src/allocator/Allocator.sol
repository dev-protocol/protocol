pragma solidity 0.5.17;

import "../common/config/UsingConfig.sol";
import "../../interface/IAllocator.sol";
import "../../interface/IWithdraw.sol";
import "../../interface/IPolicy.sol";
import "../../interface/ILockup.sol";
import "../../interface/IPropertyGroup.sol";
import "../../interface/IMetricsGroup.sol";

/**
 * A contract that determines the total number of mint.
 * Lockup contract and Withdraw contract mint new DEV tokens based on the total number of new mint determined by this contract.
 */
contract Allocator is UsingConfig, IAllocator {
	/**
	 * @dev Initialize the passed address as AddressConfig address.
	 * @param _config AddressConfig address.
	 */
	constructor(address _config) public UsingConfig(_config) {}

	/**
	 * @dev Returns the maximum number of mints per block.
	 * @return Maximum number of mints per block.
	 */
	function calculateMaxRewardsPerBlock() external view returns (uint256) {
		uint256 totalAssets = IMetricsGroup(config().metricsGroup())
			.totalIssuedMetrics();
		uint256 totalLockedUps = ILockup(config().lockup()).getAllValue();
		return IPolicy(config().policy()).rewards(totalLockedUps, totalAssets);
	}

	/**
	 * @dev Passthrough to `Withdraw.beforeBalanceChange` funtion.
	 * @param _property Address of the Property address to transfer.
	 * @param _from Address of the sender.
	 * @param _to Address of the recipient.
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
