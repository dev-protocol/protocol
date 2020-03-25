pragma solidity ^0.5.0;

import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {IStorage} from "contracts/src/common/storage/IStorage.sol";
import {EternalStorage} from "contracts/src/common/storage/EternalStorage.sol";


contract UsingStorage is Pausable, IStorage {
	address private _storage;

	modifier hasStorage() {
		require(_storage != address(0), "storage is not setted");
		_;
	}

	function eternalStorage()
		internal
		view
		hasStorage
		returns (EternalStorage)
	{
		require(paused() == false, "You cannot use that");
		return EternalStorage(_storage);
	}

	function getStorageAddress() external view hasStorage returns (address) {
		return _storage;
	}

	function createStorage() external onlyPauser {
		require(_storage == address(0), "storage is setted");
		EternalStorage tmp = new EternalStorage();
		_storage = address(tmp);
	}

	function setStorage(address _sender, address _eternalStorageAddress) external {
		require(isPauser(_sender), "you cannot do this function");
		_storage = _eternalStorageAddress;
	}

	function changeOwner(address newOwner) external onlyPauser hasStorage {
		IStorage(newOwner).setStorage(msg.sender, _storage);
		EternalStorage(_storage).changeOwner(newOwner);
	}
}
