pragma solidity 0.5.17;

import {MetricsGroup} from "contracts/src/metrics/MetricsGroup.sol";

contract MetricsGroupTest is MetricsGroup {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public MetricsGroup(_config) {}

	function __setMetricsCountPerProperty(address _property, uint256 _value)
		external
	{
		setMetricsCountPerProperty(_property, _value);
	}
}
