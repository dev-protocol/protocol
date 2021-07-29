// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface IPolicyGroup {
	function addGroup(address _addr) external;

	function isGroup(address _addr) external view returns (bool);

	function isDuringVotingPeriod(address _policy) external view returns (bool);
}
