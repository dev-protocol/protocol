pragma solidity ^0.5.0;

contract IWithdraw {
	function getRewardsAmount(address _property)
		external
		view
		returns (uint256);
}
