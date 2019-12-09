pragma solidity ^0.5.0;

import "../common/storage/UsingStorage.sol";

contract LastWithdrawalPrice is UsingStorage {

	function set(address _property, address _user, uint256 _value) external {
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
