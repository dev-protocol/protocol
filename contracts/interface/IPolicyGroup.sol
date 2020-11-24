pragma solidity >=0.5.17;

interface IPolicyGroup {
	function addGroup(address _addr) external;

	function addGroupWithoutSetVotingEnd(address _addr) external;

	function incrementVotingGroupIndex() external;

	function getVotingGroupIndex() external view returns (uint256);

	function voting(address _policy) external view returns (bool);

	function isGroup(address _addr) external view returns (bool);
}
