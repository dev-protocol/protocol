pragma solidity ^0.5.0;

import "./../../src/market/Market.sol";
import "./../../src/Allocator.sol";

contract MarketBehaviorTest {
	string public schema = "[]";
	address public market;
	address public allocator;

	function setMarket(address _market) public {
		market = _market;
	}

	function setAllocator(address _allocator) public {
		allocator = _allocator;
	}

	function authenticate(address _prop) public returns (bool) {
		Market(market).authenticatedCallback(_prop);
		return true;
	}

	function calculate(address _prop) public returns (bool) {
		Allocator(allocator).calculatedCallback(_prop, 100);
	}
}
