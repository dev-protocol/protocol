pragma solidity ^0.5.0;

contract IMetricsFactory {
	function create(address _property) external returns (address);

	function destroy(address _metrics) external;
}
