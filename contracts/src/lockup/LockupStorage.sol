pragma solidity ^0.5.0;

import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";

contract LockupStorage is UsingConfig, UsingStorage, UsingValidator {
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

	//LastMaxRewardsPrice
	function setLastMaxRewardsPrice(uint256 _value) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		eternalStorage().setUint(getLastMaxRewardsPriceKey(), _value);
	}

	function getLastMaxRewardsPrice() external view returns (uint256) {
		return eternalStorage().getUint(getLastMaxRewardsPriceKey());
	}

	function getLastMaxRewardsPriceKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_lastMaxRewardsPrice"));
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

	//CumulativeGlobalRewardsPrice
	function setCumulativeGlobalRewardsPrice(uint256 _value) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		eternalStorage().setUint(getCumulativeGlobalRewardsPriceKey(), _value);
	}

	function getCumulativeGlobalRewardsPrice() external view returns (uint256) {
		return eternalStorage().getUint(getCumulativeGlobalRewardsPriceKey());
	}

	function getCumulativeGlobalRewardsPriceKey()
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_cumulativeGlobalRewardsPrice"));
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

	//JustBeforeReduceToZero
	function setJustBeforeReduceToZero(address _property, uint256 _value)
		external
	{
		addressValidator().validateAddress(msg.sender, config().lockup());

		eternalStorage().setUint(
			getJustBeforeReduceToZeroKey(_property),
			_value
		);
	}

	function getJustBeforeReduceToZero(address _property)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(getJustBeforeReduceToZeroKey(_property));
	}

	function getJustBeforeReduceToZeroKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(abi.encodePacked("_justBeforeReduceToZero", _property));
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
