pragma solidity ^0.5.0;

import "../UseState.sol";
import "../market/MarketGroup.sol";

contract MetricsGroup is UseState {
	mapping(address => bool) private _metrics;
	uint256 public totalIssuedMetrics;

	address public addr;

	function addMetrics(address _metricsAddress) public {
		MarketGroup(marketGroup()).validateMarketAddress(msg.sender);
		require(
			_metricsAddress != address(0),
			"metrics is an invalid address."
		);
		totalIssuedMetrics += 1;
		_metrics[_metricsAddress] = true;
		addr = _metricsAddress;
	}

	function isMetrics(address _metricsAddress) public view returns (bool) {
		return _metrics[_metricsAddress];
	}
}
