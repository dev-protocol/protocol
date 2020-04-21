pragma solidity ^0.6.0;

import {IMarketBehavior} from "contracts/src/market/IMarketBehavior.sol";
import {Allocator} from "contracts/src/allocator/Allocator.sol";
import {Market} from "contracts/src/market/Market.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";


contract MarketTest3 is IMarketBehavior, UsingConfig {
	string private schemaInfo = "[]";
	mapping(address => string) internal keys;
	event LogCalculate(
		address _metrics,
		uint256 _lastBlock,
		uint256 _currentBlock
	);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function authenticate(
		address _prop,
		string memory _args1,
		string memory,
		string memory,
		string memory,
		string memory,
		// solium-disable-next-line no-trailing-whitespace
		address market
	) public override returns (address) {
		bytes32 idHash = keccak256(abi.encodePacked(_args1));
		address _metrics = Market(market).authenticatedCallback(_prop, idHash);
		keys[_metrics] = _args1;
		return _metrics;
	}

	function calculate(
		address _metrics,
		uint256 _lastBlock,
		uint256 _currentBlock
	) external override returns (bool) {
		emit LogCalculate(_metrics, _lastBlock, _currentBlock);
		return true;
	}

	function getId(address _metrics) external override view returns (string memory) {
		return keys[_metrics];
	}

	function schema() external override view returns (string memory) {
		return schemaInfo;
	}
}
