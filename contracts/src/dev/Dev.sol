pragma solidity ^0.5.0;

// prettier-ignore
import {ERC20Detailed} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
// prettier-ignore
import {ERC20Mintable} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
// prettier-ignore
import {ERC20Burnable} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {UsingConfig} from "../common/config/UsingConfig.sol";
import {Lockup} from "../lockup/Lockup.sol";

contract Dev is
	ERC20Detailed,
	ERC20Mintable,
	ERC20Burnable,
	UsingConfig,
	UsingValidator
{
	constructor(address _config)
		public
		ERC20Detailed("Dev", "DEV", 18)
		UsingConfig(_config)
	{}

	function deposit(address _to, uint256 _amount) external returns (bool) {
		require(transfer(_to, _amount), "dev transfer failed");
		lock(msg.sender, _to, _amount);
		return true;
	}

	function depositFrom(address _from, address _to, uint256 _amount)
		external
		returns (bool)
	{
		require(transferFrom(_from, _to, _amount), "dev transferFrom failed");
		lock(_from, _to, _amount);
		return true;
	}

	function fee(address _from, uint256 _amount) external returns (bool) {
		addressValidator().validateGroup(msg.sender, config().marketGroup());
		_burn(_from, _amount);
		return true;
	}

	function lock(address _from, address _to, uint256 _amount) private {
		Lockup(config().lockup()).lockup(_from, _to, _amount);
	}
}
