pragma solidity ^0.5.0;

import {IMarketBehavior} from "contracts/src/market/IMarketBehavior.sol";
import {Allocator} from "contracts/src/allocator/Allocator.sol";
import {Market} from "contracts/src/market/Market.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";

contract MarketTest1 is IMarketBehavior, UsingConfig {
	string public schema = "[]";
	bool public asynchronousMode = false;
	address metrics;
	uint256 lastBlock;
	uint256 currentBlock;
	mapping(address => string) private keys;
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
	) public returns (address) {
		bytes32 idHash = keccak256(abi.encodePacked(_args1));
		address _metrics = Market(market).authenticatedCallback(_prop, idHash);
		keys[_metrics] = _args1;
		return _metrics;
	}

	function calculate(
		address _metrics,
		uint256 _lastBlock,
		uint256 _currentBlock
	) external returns (bool) {
		metrics = _metrics;
		lastBlock = _lastBlock;
		currentBlock = _currentBlock;
		if (!asynchronousMode) {
			emit LogCalculate(_metrics, _lastBlock, _currentBlock);
			Allocator(config().allocator()).calculatedCallback(_metrics, 100);
		}
		return true;
	}

	function calculated() external returns (bool) {
		emit LogCalculate(metrics, lastBlock, currentBlock);
		Allocator(config().allocator()).calculatedCallback(metrics, 100);
		return true;
	}

	function changeAsynchronousMode(bool _mode) external {
		asynchronousMode = _mode;
	}

	function getId(address _metrics) external view returns (string memory) {
		return keys[_metrics];
	}
}
