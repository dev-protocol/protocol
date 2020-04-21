pragma solidity ^0.6.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {Allocator} from "contracts/src/allocator/Allocator.sol";
import {Lockup} from "contracts/src/lockup/Lockup.sol";


contract Property is ERC20, UsingConfig, UsingValidator {
	uint256 private constant _supply = 10000000000000000000000000;
	address public author;

	constructor(
		address _config,
		address _own,
		string memory _name,
		string memory _symbol
	) public UsingConfig(_config) ERC20(_name, _symbol) {
		addressValidator().validateAddress(
			msg.sender,
			config().propertyFactory()
		);

		author = _own;
		_mint(author, _supply);
	}

	function transfer(address _to, uint256 _value) public override returns (bool) {
		addressValidator().validateIllegalAddress(_to);
		require(_value != 0, "illegal transfer value");

		Allocator(config().allocator()).beforeBalanceChange(
			address(this),
			msg.sender,
			_to
		);
		_transfer(msg.sender, _to, _value);
	}

	function withdraw(address _sender, uint256 _value) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		ERC20 devToken = ERC20(config().token());
		devToken.transfer(_sender, _value);
	}
}
