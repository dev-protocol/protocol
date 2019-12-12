pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract WithdrawStorageAddressConfig is Ownable {

	address public allocation;
	address public lastWithdrawalPrice;
	address public pendingWithdrawal;
	address public withdrawalLimit;

	function setAllocation(address _addr) public onlyOwner {
		allocation = _addr;
	}

	function setLastWithdrawalPrice(address _addr) public onlyOwner {
		lastWithdrawalPrice = _addr;
	}

	function setPendingWithdrawal(address _addr) public onlyOwner {
		pendingWithdrawal = _addr;
	}

	function setWithdrawalLimit(address _addr) public onlyOwner {
		withdrawalLimit = _addr;
	}
}
