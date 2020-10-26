pragma solidity 0.5.17;

interface ILink {
	function getStorageLastCumulativeInterestPrice()
		external
		view
		returns (uint256);
}
