pragma solidity ^0.5.0;

import "./EternalStorage.sol";
import "./StorageProxy.sol";
import "../config/AddressConfig.sol";


contract UsingStorage {
	EternalStorage private _eternalStorage;
	constructor(address _config, bytes32 _record) public {
		AddressConfig config = AddressConfig(_config);
		_eternalStorage = EternalStorage(StorageProxy(config.storageProxy()).getStorage(_record));
	}
	function eternalStorage() internal view returns (EternalStorage) {
		return _eternalStorage;
	}
}
