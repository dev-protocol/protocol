pragma solidity ^0.5.0;

import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {Metrics} from "contracts/src/metrics/Metrics.sol";
import {IMetricsGroup} from "contracts/src/metrics/IMetricsGroup.sol";
import {IMetricsFactory} from "contracts/src/metrics/IMetricsFactory.sol";

contract MetricsFactory is
	Pausable,
	UsingConfig,
	UsingValidator,
	IMetricsFactory
{
	event Create(address indexed _from, address _metrics);
	event Destroy(address indexed _from, address _metrics);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function create(address _property) external returns (address) {
		require(paused() == false, "You cannot use that");
		addressValidator().validateGroup(msg.sender, config().marketGroup());

		Metrics metrics = new Metrics(msg.sender, _property);
		IMetricsGroup metricsGroup = IMetricsGroup(config().metricsGroup());
		address metricsAddress = address(metrics);
		metricsGroup.addGroup(metricsAddress);
		emit Create(msg.sender, metricsAddress);
		return metricsAddress;
	}

	function destroy(address _metrics) external {
		require(paused() == false, "You cannot use that");

		IMetricsGroup metricsGroup = IMetricsGroup(config().metricsGroup());
		require(metricsGroup.isGroup(_metrics), "address is not metrics");
		addressValidator().validateGroup(msg.sender, config().marketGroup());
		Metrics metrics = Metrics(_metrics);
		addressValidator().validateAddress(msg.sender, metrics.market());
		IMetricsGroup(config().metricsGroup()).removeGroup(_metrics);
		emit Destroy(msg.sender, _metrics);
	}
}
