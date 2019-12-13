pragma solidity ^0.5.0;

import "contracts/src/common/validate/AddressValidator.sol";
import {VoteTimes} from "contracts/src/vote/times/VoteTimes.sol";
import "contracts/src/metrics/Metrics.sol";
import "contracts/src/metrics/MetricsGroup.sol";

contract MetricsFactory is UsingConfig {
	event Create(address indexed _from, address _metrics);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function createMetrics(address _property) external returns (address) {
		new AddressValidator().validateAddress(
			msg.sender,
			config().marketGroup()
		);

		Metrics metrics = new Metrics(_property);
		MetricsGroup metricsGroup = MetricsGroup(config().metricsGroup());
		address metricsAddress = address(metrics);
		metricsGroup.addGroup(metricsAddress);
		emit Create(msg.sender, metricsAddress);
		return metricsAddress;
	}
}
