pragma solidity ^0.5.0;

contract IVoteCounter {

	function voteMarket(address _target, address[] calldata _properties, bool _agree) external;

	function votePolicy(address _target, address[] calldata _properties, bool _agree) external;

	function getTargetAllVoteCount(address _target) external view returns (uint256);

	function isAlreadyVote(address _target) external view returns (bool);

	function getAllPropertyVoteCount(address[] memory _properties) public view returns (uint256);
}
