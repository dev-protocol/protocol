// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface IMarketFactory {
	function create(address _addr) external returns (address);

	function enable(address _addr) external;
}
