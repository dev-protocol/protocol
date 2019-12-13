pragma solidity ^0.5.0;

import "../common/storage/UsingStorage.sol";
import "../common/config/UsingConfig.sol";
import "../common/validate/AddressValidator.sol";

contract AllocationBlockNumber is UsingStorage, UsingConfig {
	constructor(address _config) public UsingConfig(_config) UsingStorage() {}

	function set(address _metrics, uint256 _blocks) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);

		eternalStorage().setUint(getLastBlockNumberKey(_metrics), _blocks);
	}

	function setWithNow(address _metrics) external {
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
}
