// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.17;

interface IMetrics {
	function market() external view returns (address);

	function property() external view returns (address);
}
