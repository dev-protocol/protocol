pragma solidity ^0.5.0;

import {ERC20} from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import {ERC20Detailed} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {IntValidator} from "contracts/src/common/validate/IntValidator.sol";
import {AddressValidator} from "contracts/src/common/validate/AddressValidator.sol";
import {Allocator} from "contracts/src/allocator/Allocator.sol";
import {Lockup} from "contracts/src/lockup/Lockup.sol";

contract Property is ERC20, ERC20Detailed, UsingConfig {
	uint8 private constant _decimals = 18;
	uint256 private constant _supply = 10000000;
	address public author;

	constructor(
		address _config,
		address _own,
		string memory _name,
		string memory _symbol
	) public UsingConfig(_config) ERC20Detailed(_name, _symbol, _decimals) {
		new AddressValidator().validateAddress(
			msg.sender,
			config().propertyFactory()
		);

		author = _own;
		_mint(author, _supply);
	}

	function transfer(address _to, uint256 _value) public returns (bool) {
		new AddressValidator().validateDefault(_to);
		new IntValidator().validateEmpty(_value);

		Allocator(config().allocator()).beforeBalanceChange(
			address(this),
			msg.sender,
			_to
		);
		_transfer(msg.sender, _to, _value);
		return true;
	}

	function withdrawDev(address _sender) external {
		new AddressValidator().validateAddress(msg.sender, config().lockup());

		uint256 value = Lockup(config().lockup()).getValue(
			address(this),
			_sender
		);
		require(value != 0, "your token is 0");
		ERC20 devToken = ERC20(config().token());
		devToken.transfer(_sender, value);
	}
}
