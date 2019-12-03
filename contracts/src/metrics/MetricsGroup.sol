pragma solidity ^0.5.0;

import "../market/MarketGroup.sol";

contract MetricsGroup is UsingConfig {
	mapping(address => bool) private _metrics;
	uint256 public totalIssuedMetrics;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addMetrics(address _metricsAddress) public {
		require(
			MarketGroup(config().marketGroup()).isMarket(msg.sender),
			"only market contract"
		);
		require(_metricsAddress != address(0), "metrics is an invalid address");
		totalIssuedMetrics += 1;
		_metrics[_metricsAddress] = true;
	}

	function isMetrics(address _metricsAddress) public view returns (bool) {
		return _metrics[_metricsAddress];
	}
}
