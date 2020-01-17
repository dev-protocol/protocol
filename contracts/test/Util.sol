pragma solidity ^0.5.0;

contract Util {
	function blockNumber() public view returns (uint256) {
		return block.number;
	}
}
