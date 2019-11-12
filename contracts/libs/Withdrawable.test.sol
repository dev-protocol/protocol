pragma solidity ^0.5.0;

import "./Withdrawable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract WithdrawableTest is Withdrawable {
	using SafeMath for uint256;
	function t_increment(address _token, uint256 value) public {
		increment(_token, value);
	}
	function t_total(address _token) public view returns (uint256) {
		return totals[_token];
	}
	function t_price(address _token) public view returns (uint256) {
		return prices[_token];
	}
}
