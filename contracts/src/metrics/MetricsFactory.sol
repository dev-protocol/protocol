pragma solidity 0.5.17;

import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {Metrics} from "contracts/src/metrics/Metrics.sol";
import {IMetricsGroup} from "contracts/src/metrics/IMetricsGroup.sol";
import {IMetricsFactory} from "contracts/src/metrics/IMetricsFactory.sol";

/**
 * A factory contract for creating new Metrics contracts and logical deletion of Metrics contracts.
 */
contract MetricsFactory is UsingConfig, UsingValidator, IMetricsFactory {
	event Create(address indexed _from, address _metrics);
	event Destroy(address indexed _from, address _metrics);

	/**
	 * Initialize the passed address as AddressConfig address.
	 */
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	/**
	 * Creates a new Metrics contract.
	 */
	function create(address _property) external returns (address) {
		/**
		 * Validates the sender is included in the Market address set.
		 */
		addressValidator().validateGroup(msg.sender, config().marketGroup());

		/**
		 * Creates a new Metrics contract.
		 */
		Metrics metrics = new Metrics(msg.sender, _property);

		/**
		 *  Adds the new Metrics contract to the Metrics address set.
		 */
		IMetricsGroup metricsGroup = IMetricsGroup(config().metricsGroup());
		address metricsAddress = address(metrics);
		metricsGroup.addGroup(metricsAddress);

		emit Create(msg.sender, metricsAddress);
		return metricsAddress;
	}

	/**
	 * Logical deletions a Metrics contract.
	 */
	function destroy(address _metrics) external {
		/**
		 * Validates the passed address is included in the Metrics address set.
		 */
		IMetricsGroup metricsGroup = IMetricsGroup(config().metricsGroup());
		require(metricsGroup.isGroup(_metrics), "address is not metrics");

		/**
		 * Validates the sender is included in the Market address set.
		 */
		addressValidator().validateGroup(msg.sender, config().marketGroup());

		/**
		 *  Validates the sender is the Market contract associated with the passed Metrics.
		 */
		Metrics metrics = Metrics(_metrics);
		addressValidator().validateAddress(msg.sender, metrics.market());

		/**
		 * Logical deletions a Metrics contract.
		 */
		IMetricsGroup(config().metricsGroup()).removeGroup(_metrics);
		emit Destroy(msg.sender, _metrics);
	}
}
