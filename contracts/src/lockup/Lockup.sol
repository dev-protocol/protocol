pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/validate/AddressValidator.sol";
import "../common/validate/IntValidator.sol";
import "../property/Property.sol";
import "../property/PropertyGroup.sol";
import "../policy/Policy.sol";
import "../common/config/UsingConfig.sol";
import "./LockupStorage.sol";

contract Lockup is UsingConfig {
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function lockup(address _property, uint256 _value) external {
		new AddressValidator().validateGroup(
			_property,
			config().propertyGroup()
		);
		new IntValidator().validateEmpty(_value);

		bool isWaiting = getStorage().getWithdrawalStatus(_property, msg.sender) != 0;
		require(
			isWaiting == false,
			"lockup is already canceled"
		);
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
		getStorage().addValue(_property, msg.sender, _value);
		getStorage().addPropertyValue(
			_property,
			_value
		);
	}

	function cancel(address _property) external {
		new AddressValidator().validateGroup(
			_property,
			config().propertyGroup()
		);

		require(
			getStorage().hasValue(_property, msg.sender),
			"dev token is not locked"
		);
		bool isWaiting = getStorage().getWithdrawalStatus(_property, msg.sender) != 0;
		require(
			isWaiting == false,
			"lockup is already canceled"
		);
		uint256 blockNumber = Policy(config().policy()).lockUpBlocks();
		blockNumber = blockNumber.add(block.number);
		getStorage().setWithdrawalStatus(_property, msg.sender, blockNumber);
	}

	function withdraw(address _property) external {
		new AddressValidator().validateGroup(
			_property,
			config().propertyGroup()
		);

		require(
			possible(_property, msg.sender),
			"waiting for release"
		);
		uint256 lockupedValue = getStorage().getValue(
			_property,
			msg.sender
		);
		require(lockupedValue == 0, "dev token is not locked");
		Property(_property).withdrawDev(msg.sender);
		getStorage().clearValue(_property, msg.sender);
		getStorage().subPropertyValue(
			_property,
			lockupedValue
		);
		getStorage().setWithdrawalStatus(_property, msg.sender, 0);
	}

	function getPropertyValue(address _property) external view returns (uint256) {
		return getStorage().getPropertyValue(_property);
	}

	function getValue(address _property, address _sender) external view returns (uint256) {
		return getStorage().getValue(_property, _sender);
	}

	function possible(address _property, address _from)
		private
		view
		returns (bool)
	{
		uint256 blockNumber = getStorage().getWithdrawalStatus(_property, _from);
		if (blockNumber == 0) {
			return false;
		}
		return blockNumber <= block.number;
	}

	function getStorage() private view returns (LockupStorage) {
		return LockupStorage(config().lockupStorage());
	}
}
