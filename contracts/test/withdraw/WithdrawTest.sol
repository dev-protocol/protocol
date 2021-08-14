pragma solidity 0.5.17;

import {Withdraw} from "../../src/withdraw/Withdraw.sol";

contract WithdrawTest is Withdraw {
	constructor(address _config, address _devMinter)
		public
		Withdraw(_config, _devMinter)
	{}

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
}
