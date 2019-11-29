pragma solidity ^0.5.0;

import "./EternalStorage.sol";

contract StorageProxy {
	mapping(bytes32 => address) private _storageMap;
	// TODO only execute by our sysytem
	function getStorage(bytes32 _record) public returns (address) {
		address strage = _storageMap[_record];
		if (strage == address(0)) {
			EternalStorage eternalStrage = new EternalStorage();
			strage = address(eternalStrage);
			_storageMap[_record] = strage;
		}
		return strage;
	}
}
