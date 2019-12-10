pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../property/Property.sol";
import "../property/PropertyGroup.sol";
import "../policy/Policy.sol";
import "../common/config/UsingConfig.sol";
import "./LockupValue.sol";
import "./LockupPropertyValue.sol";
import "./LockupWithdrawalStatus.sol";

contract Lockup is UsingConfig {
	constructor(address _config) public UsingConfig(_config) {}

	function lockup(address _property, uint256 _value) public {
		require(
			PropertyGroup(config().propertyGroup()).isGroup(_property),
			"this address is not property contract"
		);
		LockupWithdrawalStatus withdrawalStatus = LockupWithdrawalStatus(
			config().lockupWithdrawalStatus()
		);
		require(
			withdrawalStatus.waiting(_property, msg.sender) == false,
			"lockup is already canceled"
		);
		require(_value != 0, "value is 0");
		ERC20 devToken = ERC20(config().token());
		uint256 balance = devToken.balanceOf(msg.sender);
		require(_value <= balance, "insufficient balance");
		// solium-disable-next-line security/no-low-level-calls
		(bool success, bytes memory data) = address(devToken).delegatecall(
			abi.encodeWithSignature(
				"transfer(address,uint256)",
				_property,
				_value
			)
		);
		require(success, "transfer was failed");
		require(abi.decode(data, (bool)), "transfer was failed");
		LockupValue(config().lockupValue()).add(_property, msg.sender, _value);
		LockupPropertyValue(config().lockupPropertyValue()).add(
			_property,
			_value
		);
	}

	function cancel(address _property) public {
		require(
			PropertyGroup(config().propertyGroup()).isGroup(_property),
			"this address is not property contract"
		);
		require(
			LockupValue(config().lockupValue()).hasValue(_property, msg.sender),
			"dev token is not locked"
		);
		LockupWithdrawalStatus withdrawalStatus = LockupWithdrawalStatus(
			config().lockupWithdrawalStatus()
		);
		require(
			withdrawalStatus.waiting(_property, msg.sender) == false,
			"lockup is already canceled"
		);
		withdrawalStatus.start(
			_property,
			msg.sender,
			Policy(config().policy()).lockUpBlocks()
		);
	}

	function withdraw(address _property) public {
		require(
			PropertyGroup(config().propertyGroup()).isGroup(_property),
			"this address is not property contract"
		);
		LockupWithdrawalStatus withdrawalStatus = LockupWithdrawalStatus(
			config().lockupWithdrawalStatus()
		);
		require(
			withdrawalStatus.possible(_property, msg.sender),
			"waiting for release"
		);
		uint256 lockupedValue = LockupValue(config().lockupValue()).get(
			_property,
			msg.sender
		);
		require(lockupedValue == 0, "dev token is not locked");
		Property(_property).withdrawDev(msg.sender);
		LockupValue(config().lockupValue()).clear(_property, msg.sender);
		LockupPropertyValue(config().lockupPropertyValue()).sub(
			_property,
			lockupedValue
		);
		withdrawalStatus.complete(_property, msg.sender);
	}
}
