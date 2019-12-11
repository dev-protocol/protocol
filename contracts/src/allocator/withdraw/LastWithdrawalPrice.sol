pragma solidity ^0.5.0;

import "../../common/config/UsingConfig.sol";
import "../../common/storage/UsingStorage.sol";
import "../../common/validate/AddressValidator.sol";

contract LastWithdrawalPrice is UsingConfig, UsingStorage {

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function set(address _property, address _user, uint256 _value) external {
		new AddressValidator().validateAddress(msg.sender, config().allocator());

		eternalStorage().setUint(getKey(_property, _user), _value);
	}

	function get(address _property, address _user)
		external
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getKey(_property, _user));
	}

	function getKey(address _property, address _user)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_property, _user));
	}
}
