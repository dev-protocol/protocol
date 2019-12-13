pragma solidity ^0.5.0;

import {ERC20Mintable} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import {SafeMath} from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import {AddressValidator} from "contracts/src/common/validate/AddressValidator.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";

contract WithdrawStorage is UsingStorage, UsingConfig {
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	//Allocation
	function increment(address _property, uint256 _totalValue, uint256 _priceValue) external {
		new AddressValidator().validateAddress(msg.sender, config().withdraw());

		bytes32 totalsKey = getAllocationTotalKey(_property);
		uint256 total = eternalStorage().getUint(totalsKey);
		eternalStorage().setUint(totalsKey, total.add(_totalValue));

		bytes32 pricesKey = getAllocationPriceKey(_property);

		uint256 price = eternalStorage().getUint(pricesKey);
		eternalStorage().setUint(
			pricesKey,
			price.add(_priceValue)
		);
	}
	function getRewardsAmount(address _property)
		external
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getAllocationTotalKey(_property));
	}

	function getCumulativePrice(address _property)
		external
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getAllocationPriceKey(_property));
	}

	function getAllocationTotalKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_allocationTotals", _property));
	}

	function getAllocationPriceKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_allocationPrices", _property));
	}

	//WithdrawalLimit
	function setWithdrawalLimit(
		address _property,
		address _user,
		uint256 _total,
		uint256 _balance
	) external {
		new AddressValidator().validateAddress(msg.sender, config().withdraw());

		eternalStorage().setUint(
			getWithdrawalLimitTotalKey(_property, _user),
			_total
		);
		eternalStorage().setUint(
			getWithdrawalLimitBalanceKey(_property, _user),
			_balance
		);
	}

	function getWithdrawalLimit(address _property, address _user)
		external
		view
		returns (uint256, uint256)
	{
		uint256 total = eternalStorage().getUint(
			getWithdrawalLimitTotalKey(_property, _user)
		);
		uint256 balance = eternalStorage().getUint(
			getWithdrawalLimitBalanceKey(_property, _user)
		);
		return (total, balance);
	}

	function getWithdrawalLimitTotal(address _property, address _user)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getWithdrawalLimitTotalKey(_property, _user)
			);
	}

	function getWithdrawalLimitTotalKey(address _property, address _user)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_withdrawalLimitTotal", _property, _user)
			);
	}

	function getWithdrawalLimitBalanceKey(address _property, address _user)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_withdrawalLimitBalance", _property, _user)
			);
	}

	//LastWithdrawalPrice
	function setLastWithdrawalPrice(
		address _property,
		address _user,
		uint256 _value
	) external {
		new AddressValidator().validateAddress(msg.sender, config().withdraw());

		eternalStorage().setUint(
			getLastWithdrawalPriceKey(_property, _user),
			_value
		);
	}

	function getLastWithdrawalPrice(address _property, address _user)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getLastWithdrawalPriceKey(_property, _user)
			);
	}

	function getLastWithdrawalPriceKey(address _property, address _user)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_lastWithdrawalPrice", _property, _user)
			);
	}

	//PendingWithdrawal
	function setPendingWithdrawal(
		address _property,
		address _user,
		uint256 _value
	) external {
		new AddressValidator().validateAddress(msg.sender, config().withdraw());

		eternalStorage().setUint(
			getPendingWithdrawalKey(_property, _user),
			_value
		);
	}

	function getPendingWithdrawal(address _property, address _user)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(getPendingWithdrawalKey(_property, _user));
	}

	function getPendingWithdrawalKey(address _property, address _user)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(abi.encodePacked("_pendingWithdrawal", _property, _user));
	}
}
