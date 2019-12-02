pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./EternalStorage.sol";

contract UsingStorage is Ownable {
	address private _storage;

	modifier hasStorage() {
		require(_storage != address(0), "strage is not setted");
		_;
	}

	function eternalStorage()
		internal
		view
		hasStorage
		returns (EternalStorage)
	{
		return EternalStorage(_storage);
	}

	function getStorageAddress() public view hasStorage returns (address) {
		return _storage;
	}

	function createStorage() public onlyOwner {
		require(_storage == address(0), "strage is setted");
		EternalStorage strage = new EternalStorage();
		_storage = address(strage);
	}

	function setStorage(address _storageAddress) public onlyOwner {
		_storage = _storageAddress;
	}

	function changeOwner(address newOwner) public onlyOwner {
		EternalStorage(_storage).changeOwner(newOwner);
	}
}
