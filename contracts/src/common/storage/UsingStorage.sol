pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./EternalStorage.sol";

contract UsingStorage is Ownable {
	mapping(bytes32 => address) private _storageMap;
	EternalStorage private _eternalStorage;
	constructor(address _strage) public {
		if (_strage == address(0)){
			_eternalStorage = new EternalStorage();
			return;
		}
		_eternalStorage = EternalStorage(_strage);
	}
	function eternalStorage() internal view returns (EternalStorage) {
		return _eternalStorage;
	}

	function eternalStorageVersion() internal view returns (address) {
		return address(_eternalStorage);
	}

	function upgradeOwner(address newOwner) internal onlyOwner {
		_eternalStorage.upgradeOwner(newOwner);
	}
}
