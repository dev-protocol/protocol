pragma solidity ^0.5.0;

import "./Allocator.sol";

contract AllocatorTest is Allocator {
	function getTotal(address _property) public view returns (uint256) {
		return totals[_property];
	}

	function getPrice(address _property) public view returns (uint256) {
		return prices[_property];
	}
}
