pragma solidity ^0.5.0;

import {LockupStorage} from "contracts/src/lockup/LockupStorage.sol";

contract LockupStorageTest is LockupStorage {
	function setStorageAllValueTest(uint256 _value) external {
		setStorageAllValue(_value);
	}

	function setStorageValueTest(
		address _property,
		address _sender,
		uint256 _value
	) external {
		setStorageValue(_property, _sender, _value);
	}

	function setStorageWithdrawalStatusTest(
		address _property,
		address _from,
		uint256 _value
	) external {
		setStorageWithdrawalStatus(_property, _from, _value);
	}

	function setStorageInterestPriceTest(address _property, uint256 _value)
		external
	{
		setStorageInterestPrice(_property, _value);
	}

	function setStorageLastInterestPriceTest(
		address _property,
		address _user,
		uint256 _value
	) external {
		setStorageLastInterestPrice(_property, _user, _value);
	}

	function setStorageLastSameRewardsAmountAndBlockTest(
		uint256 _amount,
		uint256 _block
	) external {
		setStorageLastSameRewardsAmountAndBlock(_amount, _block);
	}

	function setStorageCumulativeGlobalRewardsTest(uint256 _value) external {
		setStorageCumulativeGlobalRewards(_value);
	}

	function setStorageLastCumulativeGlobalRewardTest(
		address _property,
		address _user,
		uint256 _value
	) external {
		eternalStorage().setUint(
			keccak256(
				abi.encodePacked(
					"_LastCumulativeGlobalReward",
					_property,
					_user
				)
			),
			_value
		);
	}

	function setStorageCumulativeLockedUpUnitAndBlockTest(
		address _addr,
		uint256 _unit,
		uint256 _block
	) external {
		setStorageCumulativeLockedUpUnitAndBlock(_addr, _unit, _block);
	}

	function setStorageCumulativeLockedUpValueTest(
		address _addr,
		uint256 _value
	) external {
		setStorageCumulativeLockedUpValue(_addr, _value);
	}

	function setStoragePendingInterestWithdrawalTest(
		address _property,
		address _user,
		uint256 _value
	) external {
		setStoragePendingInterestWithdrawal(_property, _user, _value);
	}

	function setStorageDIP4GenesisBlockTest(uint256 _block) external {
		setStorageDIP4GenesisBlock(_block);
	}

	function setStorageLastCumulativeLockedUpAndBlockTest(
		address _property,
		address _user,
		uint256 _cLocked,
		uint256 _block
	) external {
		setStorageLastCumulativeLockedUpAndBlock(
			_property,
			_user,
			_cLocked,
			_block
		);
	}

	function setStorageLastCumulativePropertyInterestTest(
		address _property,
		address _user,
		uint256 _value
	) external {
		setStorageLastCumulativePropertyInterest(_property, _user, _value);
	}
}
