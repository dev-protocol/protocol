pragma solidity 0.5.17;

import {MetricsGroup} from "../../src/metrics/MetricsGroup.sol";

contract MetricsGroupTest is MetricsGroup {
	constructor(address _config) public MetricsGroup(_config) {}

	function __setMetricsCountPerProperty(address _property, uint256 _value)
		external
	{
		setMetricsCountPerProperty(_property, _value);
	}
}
