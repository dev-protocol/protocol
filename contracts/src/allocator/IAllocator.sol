pragma solidity ^0.5.0;

contract IAllocator {
	function calculateMaxRewardsPerBlock()
		public
		view
		returns (
			uint256 _maxHolders,
			uint256 _maxInterest,
			uint256 _maxRewards
		);

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
		// solium-disable-next-line indentation
	) external;
}
