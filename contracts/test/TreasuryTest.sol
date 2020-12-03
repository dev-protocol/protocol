pragma solidity 0.5.17;

import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TreasuryTest is Ownable {
	function withdraw(address _token) external onlyOwner returns (bool) {
		IERC20 token = IERC20(_token);
		uint256 balance = token.balanceOf(address(this));
		return IERC20(_token).transfer(msg.sender, balance);
	}
}
