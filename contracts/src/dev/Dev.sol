pragma solidity ^0.6.0;

// prettier-ignore
import {ERC20PresetMinterPauser} from "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {Lockup} from "contracts/src//lockup/Lockup.sol";


contract Dev is
	ERC20PresetMinterPauser,
	UsingConfig,
	UsingValidator
{
	constructor(address _config)
		public
		ERC20PresetMinterPauser("Dev", "DEV")
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
