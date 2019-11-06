pragma solidity ^0.5.0;

import "./Timebased.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract TimebasedTest is Timebased {
	using SafeMath for uint256;
	function t_timestamp() public view returns (uint256){
		return timestamp();
	}
}
