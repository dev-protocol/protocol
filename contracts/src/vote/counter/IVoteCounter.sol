pragma solidity ^0.5.0;

contract IVoteCounter {
	function addVoteCount(
		address _user,
		address _property,
		bool _agree
		// solium-disable-next-line indentation
	) external;

	function getAgreeCount(address _sender) external view returns (uint256);

	function getOppositeCount(address _sender) external view returns (uint256);
}
