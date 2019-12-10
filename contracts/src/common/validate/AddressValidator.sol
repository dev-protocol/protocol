pragma solidity ^0.5.0;

import "../interface/IGroup.sol";

contract AddressValidator {
	function validateDefault(address _addr) external pure {
		require(_addr != address(0), "this address is not proper");
	}
	function validateGroup(address _addr, address groupAddr) external view {
		require(IGroup(groupAddr).isGroup(_addr), "this address is not proper");
	}
	function validateGroup(
		address _addr,
		address groupAddr1,
		address groupAddr2
	) external view {
		if (IGroup(groupAddr1).isGroup(_addr)) {
			return;
		}
		require(
			IGroup(groupAddr2).isGroup(_addr),
			"this address is not proper"
		);
	}
	function validateSender(address sender, address targetSender)
		external
		pure
	{
		require(sender == targetSender, "this method cannot be executed");
	}
	function validateSender(
		address sender,
		address targetSender1,
		address targetSender2
	) external pure {
		if (sender == targetSender1) {
			return;
		}
		require(sender == targetSender2, "this method cannot be executed");
	}
}
