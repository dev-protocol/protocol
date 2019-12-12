pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract WithdrawStorageAddressConfig is Ownable {
	address public withdrawStorage;

	function setWithdrawStorage(address _addr) public onlyOwner {
		withdrawStorage = _addr;
	}
}
