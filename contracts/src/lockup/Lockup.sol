pragma solidity ^0.5.0;

import {ERC20} from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import {SafeMath} from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import {Pausable} from "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import {IntValidator} from "contracts/src/common/validate/IntValidator.sol";
import {AddressValidator} from "contracts/src/common/validate/AddressValidator.sol";
import {Property} from "contracts/src/property/Property.sol";
import {PropertyGroup} from "contracts/src/property/PropertyGroup.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {LockupStorage} from "contracts/src/lockup/LockupStorage.sol";
import {Policy} from "contracts/src/policy/Policy.sol";

contract Lockup is Pausable, UsingConfig {
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function lockup(address _property, uint256 _value) external {
		require(paused() != false, "You cannot use that");
		new AddressValidator().validateGroup(
			_property,
			config().propertyGroup()
		);
		new IntValidator().validateEmpty(_value);

		bool isWaiting = getStorage().getWithdrawalStatus(
				_property,
				msg.sender
			) !=
			0;
		require(isWaiting == false, "lockup is already canceled");
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
		getStorage().addPropertyValue(_property, _value);
		getStorage().setLastInterestPrice(
			_property,
			msg.sender,
			getStorage().getInterestPrice(_property)
		);
		getStorage().setPendingInterestWithdrawal(
			_property,
			msg.sender,
			calculateInterestAmount(_property, msg.sender)
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
		bool isWaiting = getStorage().getWithdrawalStatus(
				_property,
				msg.sender
			) !=
			0;
		require(isWaiting == false, "lockup is already canceled");
		uint256 blockNumber = Policy(config().policy()).lockUpBlocks();
		blockNumber = blockNumber.add(block.number);
		getStorage().setWithdrawalStatus(_property, msg.sender, blockNumber);
	}

	function withdraw(address _property) external {
		new AddressValidator().validateGroup(
			_property,
			config().propertyGroup()
		);

		require(possible(_property, msg.sender), "waiting for release");
		uint256 lockupedValue = getStorage().getValue(_property, msg.sender);
		require(lockupedValue == 0, "dev token is not locked");
		Property(_property).withdrawDev(msg.sender);
		getStorage().clearValue(_property, msg.sender);
		getStorage().subPropertyValue(_property, lockupedValue);
		getStorage().setWithdrawalStatus(_property, msg.sender, 0);
	}

	function increment(address _property, uint256 _interestResult) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);
		uint256 priceValue = _interestResult.div(getPropertyValue(_property));
		getStorage().incrementInterest(_property, priceValue);
	}

	function calculateInterestAmount(address _property, address _user)
		private
		view
		returns (uint256)
	{
		uint256 _last = getStorage().getLastInterestPrice(_property, _user);
		uint256 price = getStorage().getInterestPrice(_property);
		uint256 priceGap = price - _last;
		uint256 lockupedValue = getStorage().getValue(_property, _user);
		uint256 value = priceGap * lockupedValue;
		return value;
	}

	function calculateWithdrawableInterestAmount(
		address _property,
		address _user
	) private view returns (uint256) {
		uint256 pending = getStorage().getPendingInterestWithdrawal(
			_property,
			_user
		);
		return calculateInterestAmount(_property, _user).add(pending);
	}

	function withdrawInterest(address _property) public {
		uint256 value = calculateWithdrawableInterestAmount(_property, _user);
		getStorage().setPendingInterestWithdrawal(_property, msg.sender, 0);
		ERC20Mintable erc20 = ERC20Mintable(config().token());
		erc20.mint(msg.sender, value);
	}

	function getPropertyValue(address _property)
		external
		view
		returns (uint256)
	{
		return getStorage().getPropertyValue(_property);
	}

	function getValue(address _property, address _sender)
		external
		view
		returns (uint256)
	{
		return getStorage().getValue(_property, _sender);
	}

	function possible(address _property, address _from)
		private
		view
		returns (bool)
	{
		uint256 blockNumber = getStorage().getWithdrawalStatus(
			_property,
			_from
		);
		if (blockNumber == 0) {
			return false;
		}
		return blockNumber <= block.number;
	}

	function getStorage() private view returns (LockupStorage) {
		return LockupStorage(config().lockupStorage());
	}
}
