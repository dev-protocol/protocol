pragma solidity 0.5.17;

// prettier-ignore
import {ERC20Mintable} from "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {IAddressConfig} from "contracts/interface/IAddressConfig.sol";
import {IDevMinter} from "contracts/interface/IDevMinter.sol";

contract DevMinter is UsingConfig, Ownable, IDevMinter {
	/**
	 * Initialize the passed address as AddressConfig address.
	 */
	constructor(address _config) public UsingConfig(_config) {}

	/**
	 * Mint Dev token
	 */
	function mint(address account, uint256 amount) external returns (bool) {
		IAddressConfig conf = config();
		require(
			msg.sender == conf.lockup() || msg.sender == conf.withdraw(),
			"illegal access"
		);
		return ERC20Mintable(conf.token()).mint(account, amount);
	}

	/**
	 * Delete mint role
	 */
	function renounceMinter() external onlyOwner {
		IAddressConfig conf = config();
		address token = conf.token();
		ERC20Mintable(token).renounceMinter();
	}
}
