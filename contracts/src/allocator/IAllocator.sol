pragma solidity ^0.5.0;

contract IAllocator {
	function allocate(address _metrics) external;

	function calculatedCallback(address _metrics, uint256 _value) external;

	function beforeBalanceChange(address _property, address _from, address _to)
		external;

	function withdraw(address _property) external;

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
		public
		pure
		returns (
			// solium-disable-next-line indentation
			uint256
		);

}
