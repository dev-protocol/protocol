pragma solidity ^0.5.0;

import "../UseState.sol";
import "../market/MarketGroup.sol";


contract MetricsGroup is UseState {
	mapping(address => bool) internal _metrics;
	uint256 public totalIssuedMetrics;
	function addMetrics(address _metricsAddress) public {
		MarketGroup(marketGroup()).validateMarketAddress(msg.sender);
		require(_metricsAddress != address(0), "metrics is an invalid address.");
		totalIssuedMetrics += 1;
		_metrics[_metricsAddress] = true;
	}

	function isMetrics(address _metricsAddress) public view returns (bool) {
		return _metrics[_metricsAddress];
	}
}
