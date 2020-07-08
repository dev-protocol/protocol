pragma solidity ^0.5.0;

contract IVoteCounter {
	function voteMarket(
		address _target,
		address[] calldata _properties,
		bool _agree
		// solium-disable-next-line indentation
	) external;

	function votePolicy(
		address _target,
		address[] calldata _properties,
		bool _agree
		// solium-disable-next-line indentation
	) external;

	function getTargetAllVoteCount(address _target)
		external
		view
		returns (uint256);

	function isAlreadyVote(address _target) external view returns (bool);

	function getAllPropertyVoteCount(address[] memory _properties)
		public
		view
		returns (uint256);

	function getVoteCount(address property) external view returns (uint256);
}
