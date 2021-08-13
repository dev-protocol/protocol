// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface IMetrics {
	function market() external view returns (address);

	function property() external view returns (address);
}
