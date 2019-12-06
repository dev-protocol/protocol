pragma solidity ^0.5.0;

import "../config/AddressConfig.sol";


contract SenderValidator {
	function validateSender(address sender, address targetSender) external pure {
		require(
			sender == targetSender,
			"this method cannot be executed"
		);
	}
	function validateSender(address sender, address targetSender1, address targetSender2) external pure {
		if (sender == targetSender1){
			return;
		}
		require(
			sender == targetSender2,
			"this method cannot be executed"
		);
	}
}
