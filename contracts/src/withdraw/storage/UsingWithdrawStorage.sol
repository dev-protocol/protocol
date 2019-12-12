pragma solidity ^0.5.0;

import "./WithdrawStorageAddressConfig.sol";
import "./Allocation.sol";
import "./LastWithdrawalPrice.sol";
import "./PendingWithdrawal.sol";
import "./WithdrawalLimit.sol";

contract UsingWithdrawStorage {
	WithdrawStorageAddressConfig private _config;
	constructor(address _addressConfig) public {
		_config = WithdrawStorageAddressConfig(_addressConfig);
	}

	function allocation() internal view returns (Allocation) {
		return Allocation(_config.allocation());
	}

	function lastWithdrawalPrice() internal view returns (LastWithdrawalPrice) {
		return LastWithdrawalPrice(_config.lastWithdrawalPrice());
	}

	function pendingWithdrawal() internal view returns (PendingWithdrawal) {
		return PendingWithdrawal(_config.pendingWithdrawal());
	}

	function withdrawalLimit() internal view returns (WithdrawalLimit) {
		return WithdrawalLimit(_config.withdrawalLimit());
	}
}
