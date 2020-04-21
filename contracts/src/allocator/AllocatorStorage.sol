pragma solidity ^0.6.0;

import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";


contract AllocatorStorage is UsingStorage, UsingConfig, UsingValidator {
	constructor(address _config) public UsingConfig(_config) UsingStorage() {}

	// Last Block Number
	function setLastBlockNumber(address _metrics, uint256 _blocks) external {
		addressValidator().validateAddress(msg.sender, config().allocator());

		eternalStorage().setUint(getLastBlockNumberKey(_metrics), _blocks);
	}

	function getLastBlockNumber(address _metrics)
		external
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getLastBlockNumberKey(_metrics));
	}

	function getLastBlockNumberKey(address _metrics)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_lastBlockNumber", _metrics));
	}

	// Base Block Number
	function setBaseBlockNumber(uint256 _blockNumber) external {
		addressValidator().validateAddress(msg.sender, config().allocator());

		eternalStorage().setUint(getBaseBlockNumberKey(), _blockNumber);
	}

	function getBaseBlockNumber() external view returns (uint256) {
		return eternalStorage().getUint(getBaseBlockNumberKey());
	}

	function getBaseBlockNumberKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_baseBlockNumber"));
	}

	// PendingIncrement
	function setPendingIncrement(address _metrics, bool value) external {
		addressValidator().validateAddress(msg.sender, config().allocator());

		eternalStorage().setBool(getPendingIncrementKey(_metrics), value);
	}

	function getPendingIncrement(address _metrics)
		external
		view
		returns (bool)
	{
		return eternalStorage().getBool(getPendingIncrementKey(_metrics));
	}

	function getPendingIncrementKey(address _metrics)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_pendingIncrement", _metrics));
	}

	// LastAssetValueEachMetrics
	function setLastAssetValueEachMetrics(address _metrics, uint256 value)
		external
	{
		addressValidator().validateAddress(msg.sender, config().allocator());

		eternalStorage().setUint(
			getLastAssetValueEachMetricsKey(_metrics),
			value
		);
	}

	function getLastAssetValueEachMetrics(address _metrics)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(getLastAssetValueEachMetricsKey(_metrics));
	}

	function getLastAssetValueEachMetricsKey(address _addr)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_lastAssetValueEachMetrics", _addr));
	}

	// lastAssetValueEachMarketPerBlock
	function setLastAssetValueEachMarketPerBlock(address _market, uint256 value)
		external
	{
		addressValidator().validateAddress(msg.sender, config().allocator());

		eternalStorage().setUint(
			getLastAssetValueEachMarketPerBlockKey(_market),
			value
		);
	}

	function getLastAssetValueEachMarketPerBlock(address _market)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getLastAssetValueEachMarketPerBlockKey(_market)
			);
	}

	function getLastAssetValueEachMarketPerBlockKey(address _addr)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_lastAssetValueEachMarketPerBlock", _addr)
			);
	}

	// pendingLastBlockNumber
	function setPendingLastBlockNumber(address _metrics, uint256 value)
		external
	{
		addressValidator().validateAddress(msg.sender, config().allocator());

		eternalStorage().setUint(getPendingLastBlockNumberKey(_metrics), value);
	}

	function getPendingLastBlockNumber(address _metrics)
		external
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getPendingLastBlockNumberKey(_metrics));
	}

	function getPendingLastBlockNumberKey(address _addr)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_pendingLastBlockNumber", _addr));
	}
}
