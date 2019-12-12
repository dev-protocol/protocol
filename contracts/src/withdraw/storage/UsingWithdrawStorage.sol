pragma solidity ^0.5.0;

import "./WithdrawStorageAddressConfig.sol";
import "./WithdrawStorage.sol";

contract UsingWithdrawStorage {
	WithdrawStorageAddressConfig private _config;
	constructor(address _addressConfig) public {
		_config = WithdrawStorageAddressConfig(_addressConfig);
	}

	function withdrawStorage() internal view returns (WithdrawStorage) {
		return WithdrawStorage(_config.withdrawStorage());
	}
}
