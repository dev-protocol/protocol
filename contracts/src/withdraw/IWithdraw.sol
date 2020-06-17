pragma solidity ^0.5.0;

contract IWithdraw {
	function getRewardsAmount(address _property)
		external
		view
		returns (uint256);

	function beforeBalanceChange(address _property, address _from, address _to)
		external;

	function setLastBlockNumber(address _property, uint256 _blockNumber)
		external;

	function getLastBlockNumber(address _property)
		external
		view
		returns (uint256);
}
