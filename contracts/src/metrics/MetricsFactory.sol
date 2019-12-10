pragma solidity ^0.5.0;

import "../common/validate/AddressValidator.sol";
import "./Metrics.sol";
import "./MetricsGroup.sol";
import "../vote/VoteTimes.sol";

contract MetricsFactory is UsingConfig {
	event Create(address indexed _from, address _metrics);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function createMetrics(address _property) public returns (address) {
		AddressValidator validator = new AddressValidator();
		validator.validateGroup(_property, config().propertyGroup());
		validator.validateSender(msg.sender, config().marketGroup());

		Metrics metrics = new Metrics(_property);
		MetricsGroup metricsGroup = MetricsGroup(config().metricsGroup());
		address metricsAddress = address(metrics);
		metricsGroup.addGroup(metricsAddress);
		emit Create(msg.sender, metricsAddress);
		return metricsAddress;
	}
}
