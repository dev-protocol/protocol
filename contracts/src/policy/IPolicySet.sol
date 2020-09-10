pragma solidity 0.5.17;

contract IPolicySet {
	function addSet(address _addr) external;

	function reset() external;

	function count() external view returns (uint256);

	function get(uint256 _index) external view returns (address);

	function getVotingGroupIndex() external view returns (uint256);

	function setVotingEndBlockNumber(address _policy) external;

	function voting(address _policy) external view returns (bool);
}
