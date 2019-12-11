pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/storage/UsingStorage.sol";
import "../common/config/UsingConfig.sol";
import "../common/validate/AddressValidator.sol";

contract LockupPropertyValue is UsingConfig, UsingStorage {
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function add(address _property, uint256 _value) external {
		new AddressValidator().validateAddress(msg.sender, config().lockup());

		bytes32 key = getKey(_property);
		uint256 value = eternalStorage().getUint(key);
		value = value.add(_value);
		eternalStorage().setUint(key, value);
	}

	function sub(address _property, uint256 _value) external {
		new AddressValidator().validateAddress(msg.sender, config().lockup());

		bytes32 key = getKey(_property);
		uint256 value = eternalStorage().getUint(key);
		value = value.sub(_value);
		eternalStorage().setUint(key, value);
	}

	function get(address _property) external view returns (uint256) {
		bytes32 key = getKey(_property);
		return eternalStorage().getUint(key);
	}

	function getKey(address _property) private pure returns (bytes32) {
		return keccak256(abi.encodePacked(_property));
	}
}
