pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/storage/UsingStorage.sol";
import "../common/modifier/UsingModifier.sol";

contract LockupWithdrawalStatus is UsingModifier, UsingStorage {
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

	function set(address _property, address _from, uint256 _value) private {
		bytes32 key = getKey(_property, _from);
		eternalStorage().setUint(key, _value);
	}

	function get(address _property, address _from) private view returns (uint256){
		bytes32 key = getKey(_property, _from);
		return eternalStorage().getUint(key);
	}

	function start(address _property, address _from, uint256 _wait)
		external onlyLockup
	{
		set(_property, _from, block.number.add(_wait));
	}
	function possible(address _property, address _from)
		external
		view
		returns (bool)
	{
		uint256 blockNumber = get(_property, _from);
		if (blockNumber == 0) {
			return false;
		}
		return blockNumber <= block.number;
	}
	function complete(address _property, address _from) external onlyLockup {
		set(_property, _from, 0);
	}
	function waiting(address _property, address _from) external view returns (bool) {
		return get(_property, _from) != 0;
	}
}
