pragma solidity ^0.5.0;

import "../common/storage/UsingStorage.sol";
import "../common/config/UsingConfig.sol";
import "../common/validate/AddressValidator.sol";

contract AllocationBlockNumber is UsingStorage, UsingConfig{

	constructor(address _config) public UsingConfig(_config) UsingStorage() {
		createStorage();
		eternalStorage().setUint(getBaseBlockNumberKey(), block.number);
	}

	function set(address _metrics, uint256 _blocks) external {
		new AddressValidator().validateAddress(msg.sender, config().allocator());

		eternalStorage().setUint(getLastBlockNumberKey(_metrics), _blocks);
	}

	function setWithNow(address _metrics) external {
		new AddressValidator().validateAddress(msg.sender, config().allocator());

		eternalStorage().setUint(getLastBlockNumberKey(_metrics), block.number);
	}

	function getLastAllocationBlockNumber(address _metrics)
		external
		view
		returns (uint256)
	{
		uint256 blockNumber = eternalStorage().getUint(getLastBlockNumberKey(_metrics));
		uint256 lastAllocationBlockNumber = blockNumber >
			0
			? blockNumber
			: eternalStorage().getUint(getBaseBlockNumberKey());
		return lastAllocationBlockNumber;
	}

	function getBaseBlockNumberKey()
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_baseBlockNumber"));
	}

	function getLastBlockNumberKey(address _addr)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_addr));
	}
}
