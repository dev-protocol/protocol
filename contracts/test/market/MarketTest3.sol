pragma solidity ^0.5.0;

import {IMarketBehavior} from "contracts/src/market/IMarketBehavior.sol";
import {Allocator} from "contracts/src/allocator/Allocator.sol";
import {Market} from "contracts/src/market/Market.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";

contract MarketTest3 is IMarketBehavior, UsingConfig {
	string public schema = "[]";
	event LogCalculate(
		address _metrics,
		uint256 _lastBlock,
		uint256 _currentBlock
	);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function authenticate(
		address _prop,
		string calldata _args1,
		string calldata,
		string calldata,
		string calldata,
		string calldata,
		// solium-disable-next-line no-trailing-whitespace
		address market
	) external returns (address) {
		bytes32 idHash = keccak256(abi.encodePacked(_args1));
		return Market(market).authenticatedCallback(_prop, idHash);
	}

	function calculate(
		address _metrics,
		uint256 _lastBlock,
		uint256 _currentBlock
	) external returns (bool) {
		emit LogCalculate(_metrics, _lastBlock, _currentBlock);
		return true;
	}
}
