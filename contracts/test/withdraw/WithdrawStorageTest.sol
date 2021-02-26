pragma solidity 0.5.17;

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
}
