pragma solidity ^0.5.0;

// This file should delete after fixes to #321.

contract INpmMarket {
	function getMetrics(string calldata _package)
		external
		view
		returns (address);
}
