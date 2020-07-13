pragma solidity ^0.5.0;

import {IGroup} from "contracts/src/common/interface/IGroup.sol";

contract IMetricsGroup is IGroup{
	function removeGroup(address _addr) external;

	function totalIssuedMetrics() external view returns (uint256);
}
