pragma solidity ^0.5.0;

import "./Withdrawable.sol";

contract WithdrawableTest is Withdrawable {
	function t_increment(address _token, uint256 value) public {
		increment(_token, value);
	}
}
