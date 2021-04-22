// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.17;

interface IMetricsFactory {
	function create(address _property) external returns (address);

	function destroy(address _metrics) external;
}
