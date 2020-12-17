pragma solidity 0.5.17;

import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IWithdraw} from "contracts/interface/IWithdraw.sol";
import {IAddressConfig} from "contracts/interface/IAddressConfig.sol";

contract TreasuryTest is Ownable {
	IAddressConfig private config;

	/**
	 * Initialize the passed address as AddressConfig address.
	 */
	constructor(address _config) public {
		config = IAddressConfig(_config);
	}

	function withdraw(address _property) external {
		IWithdraw(config.withdraw()).withdraw(_property);
	}

	function transfer() external onlyOwner returns (bool) {
		IERC20 token = IERC20(config.token());
		uint256 balance = token.balanceOf(address(this));
		return token.transfer(msg.sender, balance);
	}
}
