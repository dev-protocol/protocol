pragma solidity ^0.5.0;

contract IPolicySet {
	function setVotingEndBlockNumber(address _policy) external;

	function voting(address _policy) external view returns (bool);
}
