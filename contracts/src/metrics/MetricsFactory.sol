pragma solidity 0.5.17;

import {UsingRegistry} from "contracts/src/common/registry/UsingRegistry.sol";
import {Metrics} from "contracts/src/metrics/Metrics.sol";
import {IMetrics} from "contracts/interface/IMetrics.sol";
import {IMetricsGroup} from "contracts/interface/IMetricsGroup.sol";
import {IMarketGroup} from "contracts/interface/IMarketGroup.sol";
import {IMetricsFactory} from "contracts/interface/IMetricsFactory.sol";

/**
 * A factory contract for creating new Metrics contracts and logical deletion of Metrics contracts.
 */
contract MetricsFactory is UsingRegistry, IMetricsFactory {
	event Create(address indexed _from, address _metrics);
	event Destroy(address indexed _from, address _metrics);

	/**
	 * Initialize the passed address as AddressConfig address.
	 */
	constructor(address _registry) public UsingRegistry(_registry) {}

	/**
	 * Creates a new Metrics contract.
	 */
	function create(address _property) external returns (address) {
		/**
		 * Validates the sender is included in the Market address set.
		 */
		require(
			IMarketGroup(registry().get("MarketGroup")).isGroup(msg.sender),
			"this is illegal address"
		);

		/**
		 * Creates a new Metrics contract.
		 */
		Metrics metrics = new Metrics(msg.sender, _property);

		/**
		 *  Adds the new Metrics contract to the Metrics address set.
		 */
		IMetricsGroup metricsGroup =
			IMetricsGroup(registry().get("MetricsGroup"));
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
		IMetricsGroup metricsGroup =
			IMetricsGroup(registry().get("MetricsGroup"));
		require(metricsGroup.isGroup(_metrics), "address is not metrics");

		/**
		 * Validates the sender is included in the Market address set.
		 */
		require(
			IMarketGroup(registry().get("MarketGroup")).isGroup(msg.sender),
			"this is illegal address"
		);

		/**
		 *  Validates the sender is the Market contract associated with the passed Metrics.
		 */
		IMetrics metrics = IMetrics(_metrics);
		require(msg.sender == metrics.market(), "this is illegal address");

		/**
		 * Logical deletions a Metrics contract.
		 */
		metricsGroup.removeGroup(_metrics);
		emit Destroy(msg.sender, _metrics);
	}
}
