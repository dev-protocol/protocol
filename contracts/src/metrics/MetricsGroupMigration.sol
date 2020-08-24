pragma solidity ^0.5.0;

import {MetricsGroup} from "contracts/src/metrics/MetricsGroup.sol";

contract MetricsGroupMigration is MetricsGroup {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public MetricsGroup(_config) {}

	function hasAssets(address _property) public view returns (bool) {
		return true;
	}

	function __setMetricsCountPerProperty(address _property, uint256 _value)
		external
		onlyOwner
	{
		setMetricsCountPerProperty(_property, _value);
	}
}
