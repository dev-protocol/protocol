pragma solidity 0.5.17;

// prettier-ignore
import {ERC20Mintable} from "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {IDevMinter} from "contracts/interface/IDevMinter.sol";

contract DevMinter is UsingConfig, Pausable, IDevMinter {
	/**
	 * Initialize the passed address as AddressConfig address.
	 */
	constructor(address _config) public UsingConfig(_config) {}

	/**
	 * Mint Dev token
	 */
	function mint(address account, uint256 amount)
		external
		whenNotPaused
		returns (bool)
	{
		return ERC20Mintable(config().token()).mint(account, amount);
	}
}
