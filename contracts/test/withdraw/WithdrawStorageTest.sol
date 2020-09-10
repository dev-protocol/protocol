pragma solidity ^0.5.0;

import {WithdrawStorage} from "contracts/src/withdraw/WithdrawStorage.sol";

contract WithdrawStorageTest is WithdrawStorage {
	function setRewardsAmountTest(address _property, uint256 _value) external {
		setRewardsAmount(_property, _value);
	}

	function setCumulativePriceTest(address _property, uint256 _value)
		external
	{
		setCumulativePrice(_property, _value);
	}

	function setWithdrawalLimitTotalTest(
		address _property,
		address _user,
		uint256 _value
	) external {
		setWithdrawalLimitTotal(_property, _user, _value);
	}

	function setWithdrawalLimitBalanceTest(
		address _property,
		address _user,
		uint256 _value
	) external {
		setWithdrawalLimitBalance(_property, _user, _value);
	}

	function setLastWithdrawalPriceTest(
		address _property,
		address _user,
		uint256 _value
	) external {
		setLastWithdrawalPrice(_property, _user, _value);
	}

	function setPendingWithdrawalTest(
		address _property,
		address _user,
		uint256 _value
	) external {
		setPendingWithdrawal(_property, _user, _value);
	}

	function setLastCumulativeHoldersRewardTest(
		address _property,
		address _user,
		uint256 _value
	) external {
		setLastCumulativeHoldersReward(_property, _user, _value);
	}
}
