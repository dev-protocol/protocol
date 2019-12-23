pragma solidity ^0.5.0;

import {IMarket} from "contracts/src/market/IMarket.sol";
import {Allocator} from "contracts/src/allocator/Allocator.sol";

contract MarketTest3 is IMarket {
	string public schema = "[]";

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public IMarket(_config) {}

	function authenticate(
		address _prop,
		string calldata,
		string calldata,
		string calldata,
		string calldata,
		// solium-disable-next-line no-trailing-whitespace
		string calldata
	) external returns (bool) {
		authenticatedCallback(_prop);
		return true;
	}

	function calculate(address _metrics, uint256, uint256)
		external
		returns (bool)
	{
		Allocator(config().allocator()).calculatedCallback(_metrics, 300);
		return true;
	}
}
