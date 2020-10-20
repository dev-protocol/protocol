pragma solidity 0.5.17;

contract IMetricsFactory {
	function create(address _property) external returns (address);

	function destroy(address _metrics) external;
}
