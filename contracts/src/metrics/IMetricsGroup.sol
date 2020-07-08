pragma solidity ^0.5.0;

contract IMetricsGroup {
	function removeGroup(address _addr) external;

	function totalIssuedMetrics() external view returns (uint256);
}
