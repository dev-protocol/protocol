pragma solidity ^0.5.0;

import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {VoteTimes} from "contracts/src/vote/times/VoteTimes.sol";
import {Metrics} from "contracts/src/metrics/Metrics.sol";
import {MetricsGroup} from "contracts/src/metrics/MetricsGroup.sol";


contract MetricsFactory is Pausable, UsingConfig, UsingValidator {
	event Create(address indexed _from, address _metrics);
	event Destroy(address indexed _from, address _metrics);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function create(address _property) external returns (address) {
		require(paused() == false, "You cannot use that");
		addressValidator().validateGroup(msg.sender, config().marketGroup());

		Metrics metrics = new Metrics(msg.sender, _property);
		MetricsGroup metricsGroup = MetricsGroup(config().metricsGroup());
		address metricsAddress = address(metrics);
		metricsGroup.addGroup(metricsAddress);
		emit Create(msg.sender, metricsAddress);
		return metricsAddress;
	}

	function destroy(address _metrics) external {
		require(paused() == false, "You cannot use that");
		if (isPauser(msg.sender) == false) {
			addressValidator().validateGroup(msg.sender, config().marketGroup());
		}
		MetricsGroup metricsGroup = MetricsGroup(config().metricsGroup());
		require(metricsGroup.isGroup(_metrics), "address is not metrics");
		metricsGroup.removeGroup(_metrics);
		emit Destroy(msg.sender, _metrics);
	}
}
