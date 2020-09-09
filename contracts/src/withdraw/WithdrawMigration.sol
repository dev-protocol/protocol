pragma solidity ^0.5.0;

import {Withdraw} from "contracts/src/withdraw/Withdraw.sol";
import {WithdrawStorage} from "contracts/src/withdraw/WithdrawStorage.sol";
import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";

contract WithdrawMigration is Withdraw, Ownable {
	constructor(address _config) public Withdraw(_config) {}

	function setLastCumulativeHoldersReward(
		address _property,
		address _user,
		uint256 _value
	) external onlyOwner {
		WithdrawStorage withdrawStorage = WithdrawStorage(
			config().withdrawStorage()
		);
		withdrawStorage.setLastCumulativeHoldersReward(
			_property,
			_user,
			_value
		);
	}
}
