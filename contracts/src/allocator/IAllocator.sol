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

	function calculatePerBlock(address _property)
		external
		view
		returns (
			// solium-disable-next-line indentation
			uint256 _holders,
			uint256 _interest,
			uint256 _maxHolders,
			uint256 _maxInterest
		);

	function calculate(
		address _property,
		uint256 _beginBlock,
		uint256 _endBlock
	)
		external
		view
		returns (
			// solium-disable-next-line indentation
			uint256 _holders,
			uint256 _interest,
			uint256 _maxHolders,
			uint256 _maxInterest
		);

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
		// solium-disable-next-line indentation
	) external;

	function getRewardsAmount(address _property)
		external
		view
		returns (uint256);

	function allocation(
		uint256 _blocks,
		uint256 _mint,
		uint256 _lockedUps,
		uint256 _totalLockedUps
	)
		public
		pure
		returns (
			// solium-disable-next-line indentation
			uint256
		);
}
