pragma solidity ^0.5.0;

contract IVoteTimes {
	function validateTargetPeriod(
		address _property,
		uint256 _beginBlock,
		uint256 _endBlock
	)
		external
		returns (
			// solium-disable-next-line indentation
			bool
		);

	function addVoteTime() external;
	function addVoteTimesByProperty(address _property) external;
	function resetVoteTimesByProperty(address _property) public;
}
