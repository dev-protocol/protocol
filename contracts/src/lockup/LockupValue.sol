pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/storage/UsingStorage.sol";
import "../common/modifier/UsingModifier.sol";

contract LockupValue is UsingModifier, UsingStorage {
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingModifier(_config){}

	function getKey(address _property, address _sender)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_property, _sender));
	}

	function clear(address _property, address _sender) external onlyLockup {
		bytes32 key = getKey(_property, _sender);
		eternalStorage().setUint(key, 0);
	}

	function hasValue(address _property, address _sender)
		external
		view
		returns (bool)
	{
		bytes32 key = getKey(_property, _sender);
		return eternalStorage().getUint(key) != 0;
	}

	function get(address _property, address _sender)
		external
		view
		returns (uint256)
	{
		bytes32 key = getKey(_property, _sender);
		return eternalStorage().getUint(key);
	}

	function add(address _property, address _sender, uint256 _value) external onlyLockup {
		bytes32 key = getKey(_property, _sender);
		uint256 value = eternalStorage().getUint(key);
		value = value.add(_value);
		eternalStorage().setUint(key, value);
	}
}
