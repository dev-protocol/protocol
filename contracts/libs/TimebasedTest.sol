pragma solidity ^0.5.0;

import "./Timebased.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract TimebasedTest is Timebased {
	using SafeMath for uint256;
	function t_timestamp() public view returns (uint256){
		return timestamp();
	}
	function t_setSecondsPerBlock(uint256 _sec) public{
		_setSecondsPerBlock(_sec);
	}
	// function t_time() public view returns (uint256){
	// 	return baseTime.time;
	// }
	// function t_secondsPerBlock() public view returns (uint256){
	// 	return secondsPerBlock;
	// }
	// function t_blockHeight() public view returns (uint256){
	// 	return baseTime.blockHeight;
	// }
	// function t_blockNumber() public view returns (uint256){
	// 	return block.number;
	// }
}
