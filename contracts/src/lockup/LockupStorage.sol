pragma solidity ^0.5.0;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";

contract LockupStorage is UsingConfig, UsingStorage, UsingValidator {
	using SafeMath for uint256;

	uint256 constant basis = 100000000000000000000000000000000;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	//Last Block Number
	function setLastBlockNumber(address _property, uint256 _value) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		bytes32 key = getLastBlockNumberKey(_property);
		eternalStorage().setUint(key, _value);
	}

	function getLastBlockNumber(address _property)
		external
		view
		returns (uint256)
	{
		bytes32 key = getLastBlockNumberKey(_property);
		return eternalStorage().getUint(key);
	}

	function getLastBlockNumberKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_lastBlockNumber", _property));
	}

	//AllValue
	function setAllValue(uint256 _value) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		bytes32 key = getAllValueKey();
		eternalStorage().setUint(key, _value);
	}

	function getAllValue() external view returns (uint256) {
		bytes32 key = getAllValueKey();
		return eternalStorage().getUint(key);
	}

	function getAllValueKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_allValue"));
	}

	//Value
	function setValue(
		address _property,
		address _sender,
		uint256 _value
	) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		bytes32 key = getValueKey(_property, _sender);
		eternalStorage().setUint(key, _value);
	}

	function getValue(address _property, address _sender)
		external
		view
		returns (uint256)
	{
		bytes32 key = getValueKey(_property, _sender);
		return eternalStorage().getUint(key);
	}

	function getValueKey(address _property, address _sender)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_value", _property, _sender));
	}

	//PropertyValue
	function setPropertyValue(address _property, uint256 _value) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		bytes32 key = getPropertyValueKey(_property);
		eternalStorage().setUint(key, _value);
	}

	function getPropertyValue(address _property)
		external
		view
		returns (uint256)
	{
		bytes32 key = getPropertyValueKey(_property);
		return eternalStorage().getUint(key);
	}

	function getPropertyValueKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_propertyValue", _property));
	}

	//WithdrawalStatus
	function setWithdrawalStatus(
		address _property,
		address _from,
		uint256 _value
	) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		bytes32 key = getWithdrawalStatusKey(_property, _from);
		eternalStorage().setUint(key, _value);
	}

	function getWithdrawalStatus(address _property, address _from)
		external
		view
		returns (uint256)
	{
		bytes32 key = getWithdrawalStatusKey(_property, _from);
		return eternalStorage().getUint(key);
	}

	function getWithdrawalStatusKey(address _property, address _sender)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_withdrawalStatus", _property, _sender)
			);
	}

	//InterestPrice
	function setInterestPrice(address _property, uint256 _value) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		eternalStorage().setUint(getInterestPriceKey(_property), _value);
	}

	function getInterestPrice(address _property)
		external
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getInterestPriceKey(_property));
	}

	function getInterestPriceKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_interestTotals", _property));
	}

	//LastInterestPrice
	function setLastInterestPrice(
		address _property,
		address _user,
		uint256 _value
	) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		eternalStorage().setUint(
			getLastInterestPriceKey(_property, _user),
			_value
		);
	}

	function getLastInterestPrice(address _property, address _user)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(getLastInterestPriceKey(_property, _user));
	}

	function getLastInterestPriceKey(address _property, address _user)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_lastLastInterestPrice", _property, _user)
			);
	}

	//LastSameRewardsPriceBlock
	function setLastSameRewardsPriceBlock(uint256 _value) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		eternalStorage().setUint(getLastSameRewardsPriceBlockKey(), _value);
	}

	function getLastSameRewardsPriceBlock() external view returns (uint256) {
		return eternalStorage().getUint(getLastSameRewardsPriceBlockKey());
	}

	function getLastSameRewardsPriceBlockKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_LastSameRewardsPriceBlock"));
	}

	//CumulativeGlobalRewards
	function setCumulativeGlobalRewards(uint256 _value) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		eternalStorage().setUint(getCumulativeGlobalRewardsKey(), _value);
	}

	function getCumulativeGlobalRewards() external view returns (uint256) {
		return eternalStorage().getUint(getCumulativeGlobalRewardsKey());
	}

	function getCumulativeGlobalRewardsKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_cumulativeGlobalRewards"));
	}

	//LastCumulativeGlobalInterestPrice
	function setLastCumulativeGlobalInterestPrice(
		address _property,
		address _user,
		uint256 _value
	) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		eternalStorage().setUint(
			getLastCumulativeGlobalInterestPriceKey(_property, _user),
			_value
		);
	}

	function getLastCumulativeGlobalInterestPrice(
		address _property,
		address _user
	) external view returns (uint256) {
		return
			eternalStorage().getUint(
				getLastCumulativeGlobalInterestPriceKey(_property, _user)
			);
	}

	function getLastCumulativeGlobalInterestPriceKey(
		address _property,
		address _user
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					"_lastCumulativeGlobalInterestPrice",
					_property,
					_user
				)
			);
	}

	//CumulativeLockedUpUnitAndBlock
	function setCumulativeLockedUpUnitAndBlock(
		address _addr,
		uint256 _unit,
		uint256 _block
	) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		uint256 record = _unit.mul(basis).add(_block);
		eternalStorage().setUint(
			getCumulativeLockedUpUnitAndBlockKey(_addr),
			record
		);
	}

	function getCumulativeLockedUpUnitAndBlock(address _addr)
		external
		view
		returns (uint256 _unit, uint256 _block)
	{
		uint256 record = eternalStorage().getUint(
			getCumulativeLockedUpUnitAndBlockKey(_addr)
		);
		uint256 unit = record.div(basis);
		uint256 blockNumber = record.sub(unit.mul(basis));
		return (unit, blockNumber);
	}

	function getCumulativeLockedUpUnitAndBlockKey(address _addr)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_cumulativeLockedUpUnitAndBlock", _addr)
			);
	}

	//CumulativeLockedUpValue
	function setCumulativeLockedUpValue(address _addr, uint256 _value)
		external
	{
		addressValidator().validateAddress(msg.sender, config().lockup());

		eternalStorage().setUint(getCumulativeLockedUpValueKey(_addr), _value);
	}

	function getCumulativeLockedUpValue(address _addr)
		external
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getCumulativeLockedUpValueKey(_addr));
	}

	function getCumulativeLockedUpValueKey(address _addr)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_cumulativeLockedUpValue", _addr));
	}

	//PendingWithdrawal
	function setPendingInterestWithdrawal(
		address _property,
		address _user,
		uint256 _value
	) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		eternalStorage().setUint(
			getPendingInterestWithdrawalKey(_property, _user),
			_value
		);
	}

	function getPendingInterestWithdrawal(address _property, address _user)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getPendingInterestWithdrawalKey(_property, _user)
			);
	}

	function getPendingInterestWithdrawalKey(address _property, address _user)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_pendingInterestWithdrawal", _property, _user)
			);
	}
}
