pragma solidity ^0.5.0;

import {Pausable} from "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {AddressValidator} from "contracts/src/common/validate/AddressValidator.sol";
import {VoteTimes} from "contracts/src/vote/times/VoteTimes.sol";
import {Metrics} from "contracts/src/metrics/Metrics.sol";
import {MetricsGroup} from "contracts/src/metrics/MetricsGroup.sol";

contract MetricsFactory is Pausable, UsingConfig {
	event Create(address indexed _from, address _metrics);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function create(address _property) external returns (address) {
		require(paused() == false, "You cannot use that");
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
