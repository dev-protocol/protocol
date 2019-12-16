pragma solidity ^0.5.0;

import {Market} from "contracts/src/market/Market.sol";
import {IMarket} from "contracts/src/market/IMarket.sol";
import {Allocator} from "contracts/src/allocator/Allocator.sol";

contract MarketTest1 is IMarket {
	string public schema = "[]";
	address public market;
	address public allocator;

	function setMarket(address _market) external {
		market = _market;
	}

	function setAllocator(address _allocator) external {
		allocator = _allocator;
	}

	function authenticate(
		address _prop,
		string calldata,
		string calldata,
		string calldata,
		string calldata,
		// solium-disable-next-line no-trailing-whitespace
		string calldata
	) external returns (bool) {
		Market(market).authenticatedCallback(_prop);
		return true;
	}

	function calculate(address _metrics, uint256, uint256)
		external
		returns (bool)
	{
		Allocator(allocator).calculatedCallback(_metrics, 100);
		return true;
	}
}
