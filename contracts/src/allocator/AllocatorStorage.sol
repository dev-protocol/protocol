pragma solidity ^0.5.0;

import "contracts/src/common/storage/UsingStorage.sol";
import "contracts/src/common/config/UsingConfig.sol";
import "contracts/src/common/validate/AddressValidator.sol";

contract AllocatorStorage is UsingStorage, UsingConfig {
	constructor(address _config) public UsingConfig(_config) UsingStorage() {}

	// Allocation Block Number
	function setAllocationBlockNumber(address _metrics, uint256 _blocks)
		external
	{
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);

		eternalStorage().setUint(getLastBlockNumberKey(_metrics), _blocks);
	}

	function setAllocationBlockNumberWithNow(address _metrics) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);

		eternalStorage().setUint(getLastBlockNumberKey(_metrics), block.number);
	}

	function setBaseBlockNumber() external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);

		eternalStorage().setUint(getBaseBlockNumberKey(), block.number);
	}

	function getBaseBlockNumber() external view returns (uint256) {
		return eternalStorage().getUint(getBaseBlockNumberKey());
	}

	function getLastBlockNumber(address _addr) external view returns (uint256) {
		return eternalStorage().getUint(getLastBlockNumberKey(_addr));
	}

	function getBaseBlockNumberKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_baseBlockNumber"));
	}

	function getLastBlockNumberKey(address _addr)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_lastBlockNumber", _addr));
	}

	// PendingIncrement
	function setPendingIncrement(address _metrics, bool value) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);

		eternalStorage().setBool(getPendingIncrementKey(_metrics), value);
	}

	function getPendingIncrement(address _metrics)
		external
		view
		returns (bool)
	{
		return eternalStorage().getBool(getPendingIncrementKey(_metrics));
	}

	function getPendingIncrementKey(address _addr)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_pendingIncrement", _addr));
	}

	// LastAllocationBlockEachMetrics
	function setLastAllocationBlockEachMetrics(
		address _metrics,
		uint256 blockNumber
	) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);

		eternalStorage().setUint(
			getLastAllocationBlockEachMetricsKey(_metrics),
			blockNumber
		);
	}

	function getLastAllocationBlockEachMetrics(address _metrics)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getLastAllocationBlockEachMetricsKey(_metrics)
			);
	}

	function getLastAllocationBlockEachMetricsKey(address _addr)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_lastAllocationBlockEachMetrics", _addr)
			);
	}

	// LastAssetValueEachMetrics
	function setLastAssetValueEachMetrics(address _metrics, uint256 value)
		external
	{
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);

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
	function setLastAssetValueEachMarketPerBlock(
		address _metrics,
		uint256 value
	) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);

		eternalStorage().setUint(
			getLastAssetValueEachMarketPerBlockKey(_metrics),
			value
		);
	}

	function getLastAssetValueEachMarketPerBlock(address _metrics)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getLastAssetValueEachMarketPerBlockKey(_metrics)
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
}
