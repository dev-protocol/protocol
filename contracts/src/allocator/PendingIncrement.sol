pragma solidity ^0.5.0;

import "../common/storage/UsingStorage.sol";
import "../common/config/UsingConfig.sol";
import "../common/validate/AddressValidator.sol";

contract PendingIncrement is UsingConfig, UsingStorage{

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function set(address _metrics) external {
		new AddressValidator().validateAddress(msg.sender, config().allocator());

		eternalStorage().setBool(getKey(_metrics), true);
	}

	function unset(address _metrics) external {
		new AddressValidator().validateAddress(msg.sender, config().allocator());

		eternalStorage().setBool(getKey(_metrics), false);
	}

	function isPending(address _metrics) external view returns (bool){
		return eternalStorage().getBool(getKey(_metrics));
	}

	function getKey(address _addr)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_addr));
	}
}
