pragma solidity 0.5.17;

import {LegacyWithdraw} from "contracts/src/withdraw/LegacyWithdraw.sol";

contract MigrateWithdraw is LegacyWithdraw {
	constructor(address _config) public LegacyWithdraw(_config) {}

	function __initLastWithdraw(
		address _property,
		address _user,
		uint256 _cHoldersPrice
	) public onlyOwner {
		require(
			getStorageLastWithdrawnReward(_property, _user) != _cHoldersPrice,
			"ALREADY EXISTS"
		);
		setStorageLastWithdrawnReward(_property, _user, _cHoldersPrice);
	}

	function __initLastTransfer(
		address _property,
		address _to,
		uint256 _cHoldersPrice
	) public onlyOwner {
		require(
			getStorageLastWithdrawnReward(_property, _to) != _cHoldersPrice,
			"ALREADY EXISTS"
		);
		setStorageLastWithdrawnReward(_property, _to, _cHoldersPrice);
	}
}
