pragma solidity ^0.5.0;

contract IAllocator {
	function calculateMaxRewardsPerBlock() public view returns (uint256);

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
		// solium-disable-next-line indentation
	) external;
}
