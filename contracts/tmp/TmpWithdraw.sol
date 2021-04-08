pragma solidity 0.5.17;

import {Withdraw} from "contracts/src/withdraw/Withdraw.sol";

contract TmpWithdraw is Withdraw {
	constructor(address _config) public Withdraw(_config) {}

	function setDevMint(address _devMint) external onlyOwner {
		setStorageDevMinter(_devMint);
	}
}
