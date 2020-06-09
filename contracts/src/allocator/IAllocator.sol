pragma solidity ^0.5.0;

contract IAllocator {
	function calculate(
		address _property,
		uint256 _beginBlock,
		uint256 _endBlock
	)
		external view returns (uint256 _holders, uint256 _interest);

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
		uint256 _value,
		uint256 _marketValue,
		uint256 _assets,
		uint256 _totalAssets
	)
		external
		pure
		returns (
			// solium-disable-next-line indentation
			uint256
		);

	function allocatable(
		address _property,
		uint256 _beginBlock,
		uint256 _endBlock
	)
		external view returns (bool);

	function validateTargetPeriod(
		address _property,
		uint256 _beginBlock,
		uint256 _endBlock
	)
		external returns(bool);
}
