pragma solidity 0.5.17;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";

contract LockupStorage is UsingStorage {
	using SafeMath for uint256;

	uint256 public constant basis = 100000000000000000000000000000000;

	//AllValue
	function setStorageAllValue(uint256 _value) internal {
		bytes32 key = getStorageAllValueKey();
		eternalStorage().setUint(key, _value);
	}

	function getStorageAllValue() public view returns (uint256) {
		bytes32 key = getStorageAllValueKey();
		return eternalStorage().getUint(key);
	}

	function getStorageAllValueKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_allValue"));
	}

	//Value
	function setStorageValue(
		address _property,
		address _sender,
		uint256 _value
	) internal {
		bytes32 key = getStorageValueKey(_property, _sender);
		eternalStorage().setUint(key, _value);
	}

	function getStorageValue(address _property, address _sender)
		public
		view
		returns (uint256)
	{
		bytes32 key = getStorageValueKey(_property, _sender);
		return eternalStorage().getUint(key);
	}

	function getStorageValueKey(address _property, address _sender)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_value", _property, _sender));
	}

	//PropertyValue
	function setStoragePropertyValue(address _property, uint256 _value)
		internal
	{
		bytes32 key = getStoragePropertyValueKey(_property);
		eternalStorage().setUint(key, _value);
	}

	function getStoragePropertyValue(address _property)
		public
		view
		returns (uint256)
	{
		bytes32 key = getStoragePropertyValueKey(_property);
		return eternalStorage().getUint(key);
	}

	function getStoragePropertyValueKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_propertyValue", _property));
	}

	//WithdrawalStatus
	function setStorageWithdrawalStatus(
		address _property,
		address _from,
		uint256 _value
	) internal {
		bytes32 key = getStorageWithdrawalStatusKey(_property, _from);
		eternalStorage().setUint(key, _value);
	}

	function getStorageWithdrawalStatus(address _property, address _from)
		public
		view
		returns (uint256)
	{
		bytes32 key = getStorageWithdrawalStatusKey(_property, _from);
		return eternalStorage().getUint(key);
	}

	function getStorageWithdrawalStatusKey(address _property, address _sender)
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
	function setStorageInterestPrice(address _property, uint256 _value)
		internal
	{
		// The previously used function
		// This function is only used in testing
		eternalStorage().setUint(getStorageInterestPriceKey(_property), _value);
	}

	function getStorageInterestPrice(address _property)
		public
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getStorageInterestPriceKey(_property));
	}

	function getStorageInterestPriceKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_interestTotals", _property));
	}

	//LastInterestPrice
	function setStorageLastInterestPrice(
		address _property,
		address _user,
		uint256 _value
	) internal {
		eternalStorage().setUint(
			getStorageLastInterestPriceKey(_property, _user),
			_value
		);
	}

	function getStorageLastInterestPrice(address _property, address _user)
		public
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getStorageLastInterestPriceKey(_property, _user)
			);
	}

	function getStorageLastInterestPriceKey(address _property, address _user)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_lastLastInterestPrice", _property, _user)
			);
	}

	//LastSameRewardsAmountAndBlock
	function setStorageLastSameRewardsAmountAndBlock(
		uint256 _amount,
		uint256 _block
	) internal {
		uint256 record = _amount.mul(basis).add(_block);
		eternalStorage().setUint(
			getStorageLastSameRewardsAmountAndBlockKey(),
			record
		);
	}

	function getStorageLastSameRewardsAmountAndBlock()
		public
		view
		returns (uint256 _amount, uint256 _block)
	{
		uint256 record = eternalStorage().getUint(
			getStorageLastSameRewardsAmountAndBlockKey()
		);
		uint256 amount = record.div(basis);
		uint256 blockNumber = record.sub(amount.mul(basis));
		return (amount, blockNumber);
	}

	function getStorageLastSameRewardsAmountAndBlockKey()
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_LastSameRewardsAmountAndBlock"));
	}

	//CumulativeGlobalRewards
	function setStorageCumulativeGlobalRewards(uint256 _value) internal {
		eternalStorage().setUint(
			getStorageCumulativeGlobalRewardsKey(),
			_value
		);
	}

	function getStorageCumulativeGlobalRewards() public view returns (uint256) {
		return eternalStorage().getUint(getStorageCumulativeGlobalRewardsKey());
	}

	function getStorageCumulativeGlobalRewardsKey()
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_cumulativeGlobalRewards"));
	}

	//LastCumulativeGlobalReward
	function setStorageLastCumulativeGlobalReward(
		address _property,
		address _user,
		uint256 _value
	) internal {
		eternalStorage().setUint(
			getStorageLastCumulativeGlobalRewardKey(_property, _user),
			_value
		);
	}

	function getStorageLastCumulativeGlobalReward(
		address _property,
		address _user
	) public view returns (uint256) {
		return
			eternalStorage().getUint(
				getStorageLastCumulativeGlobalRewardKey(_property, _user)
			);
	}

	function getStorageLastCumulativeGlobalRewardKey(
		address _property,
		address _user
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					"_LastCumulativeGlobalReward",
					_property,
					_user
				)
			);
	}

	//LastCumulativePropertyInterest
	function setStorageLastCumulativePropertyInterest(
		address _property,
		address _user,
		uint256 _value
	) internal {
		eternalStorage().setUint(
			getStorageLastCumulativePropertyInterestKey(_property, _user),
			_value
		);
	}

	function getStorageLastCumulativePropertyInterest(
		address _property,
		address _user
	) public view returns (uint256) {
		return
			eternalStorage().getUint(
				getStorageLastCumulativePropertyInterestKey(_property, _user)
			);
	}

	function getStorageLastCumulativePropertyInterestKey(
		address _property,
		address _user
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					"_lastCumulativePropertyInterest",
					_property,
					_user
				)
			);
	}

	//CumulativeLockedUpUnitAndBlock
	function setStorageCumulativeLockedUpUnitAndBlock(
		address _addr,
		uint256 _unit,
		uint256 _block
	) internal {
		uint256 record = _unit.mul(basis).add(_block);
		eternalStorage().setUint(
			getStorageCumulativeLockedUpUnitAndBlockKey(_addr),
			record
		);
	}

	function getStorageCumulativeLockedUpUnitAndBlock(address _addr)
		public
		view
		returns (uint256 _unit, uint256 _block)
	{
		uint256 record = eternalStorage().getUint(
			getStorageCumulativeLockedUpUnitAndBlockKey(_addr)
		);
		uint256 unit = record.div(basis);
		uint256 blockNumber = record.sub(unit.mul(basis));
		return (unit, blockNumber);
	}

	function getStorageCumulativeLockedUpUnitAndBlockKey(address _addr)
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
	function setStorageCumulativeLockedUpValue(address _addr, uint256 _value)
		internal
	{
		eternalStorage().setUint(
			getStorageCumulativeLockedUpValueKey(_addr),
			_value
		);
	}

	function getStorageCumulativeLockedUpValue(address _addr)
		public
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getStorageCumulativeLockedUpValueKey(_addr)
			);
	}

	function getStorageCumulativeLockedUpValueKey(address _addr)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_cumulativeLockedUpValue", _addr));
	}

	//PendingWithdrawal
	function setStoragePendingInterestWithdrawal(
		address _property,
		address _user,
		uint256 _value
	) internal {
		eternalStorage().setUint(
			getStoragePendingInterestWithdrawalKey(_property, _user),
			_value
		);
	}

	function getStoragePendingInterestWithdrawal(
		address _property,
		address _user
	) public view returns (uint256) {
		return
			eternalStorage().getUint(
				getStoragePendingInterestWithdrawalKey(_property, _user)
			);
	}

	function getStoragePendingInterestWithdrawalKey(
		address _property,
		address _user
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked("_pendingInterestWithdrawal", _property, _user)
			);
	}

	//DIP4GenesisBlock
	function setStorageDIP4GenesisBlock(uint256 _block) internal {
		eternalStorage().setUint(getStorageDIP4GenesisBlockKey(), _block);
	}

	function getStorageDIP4GenesisBlock() public view returns (uint256) {
		return eternalStorage().getUint(getStorageDIP4GenesisBlockKey());
	}

	function getStorageDIP4GenesisBlockKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_dip4GenesisBlock"));
	}

	//LastCumulativeLockedUpAndBlock
	function setStorageLastCumulativeLockedUpAndBlock(
		address _property,
		address _user,
		uint256 _cLocked,
		uint256 _block
	) internal {
		uint256 record = _cLocked.mul(basis).add(_block);
		eternalStorage().setUint(
			getStorageLastCumulativeLockedUpAndBlockKey(_property, _user),
			record
		);
	}

	function getStorageLastCumulativeLockedUpAndBlock(
		address _property,
		address _user
	) public view returns (uint256 _cLocked, uint256 _block) {
		uint256 record = eternalStorage().getUint(
			getStorageLastCumulativeLockedUpAndBlockKey(_property, _user)
		);
		uint256 cLocked = record.div(basis);
		uint256 blockNumber = record.sub(cLocked.mul(basis));

		return (cLocked, blockNumber);
	}

	function getStorageLastCumulativeLockedUpAndBlockKey(
		address _property,
		address _user
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					"_lastCumulativeLockedUpAndBlock",
					_property,
					_user
				)
			);
	}

	//lastStakedInterestPrice
	function setStorageLastStakedInterestPrice(
		address _property,
		address _user,
		uint256 _value
	) internal {
		eternalStorage().setUint(
			getStorageLastStakedInterestPriceKey(_property, _user),
			_value
		);
	}

	function getStorageLastStakedInterestPrice(address _property, address _user)
		public
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getStorageLastStakedInterestPriceKey(_property, _user)
			);
	}

	function getStorageLastStakedInterestPriceKey(
		address _property,
		address _user
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked("_lastStakedInterestPrice", _property, _user)
			);
	}

	//lastStakesChangedCumulativeReward
	function setStorageLastStakesChangedCumulativeReward(uint256 _value)
		internal
	{
		eternalStorage().setUint(
			getStorageLastStakesChangedCumulativeRewardKey(),
			_value
		);
	}

	function getStorageLastStakesChangedCumulativeReward()
		public
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getStorageLastStakesChangedCumulativeRewardKey()
			);
	}

	function getStorageLastStakesChangedCumulativeRewardKey()
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(abi.encodePacked("_lastStakesChangedCumulativeReward"));
	}

	//lastStakesChangedHoldersPrice
	function setStorageLastStakesChangedHoldersPrice(uint256 _value) internal {
		eternalStorage().setUint(
			getStorageLastStakesChangedHoldersPriceKey(),
			_value
		);
	}

	function getStorageLastStakesChangedHoldersPrice()
		public
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getStorageLastStakesChangedHoldersPriceKey()
			);
	}

	function getStorageLastStakesChangedHoldersPriceKey()
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_lastStakesChangedHoldersPrice"));
	}

	//lastStakesChangedInterestPrice
	function setStorageLastStakesChangedInterestPrice(uint256 _value) internal {
		eternalStorage().setUint(
			getStorageLastStakesChangedInterestPriceKey(),
			_value
		);
	}

	function getStorageLastStakesChangedInterestPrice()
		public
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getStorageLastStakesChangedInterestPriceKey()
			);
	}

	function getStorageLastStakesChangedInterestPriceKey()
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_lastStakesChangedInterestPrice"));
	}
}
