pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "../config/UsingConfig.sol";
import "../Allocator.sol";
import "../Lockup.sol";

contract Property is ERC20, ERC20Detailed, UsingConfig {
	address public author;
	constructor(
		address _config,
		address _own,
		string memory _name,
		string memory _symbol,
		uint8 _decimals,
		uint256 _supply
	) public UsingConfig(_config) ERC20Detailed(_name, _symbol, _decimals) {
		author = _own;
		_mint(author, _supply);
	}

	function transfer(address _to, uint256 _value) public returns (bool) {
		Allocator(config().allocator()).beforeBalanceChange(
			address(this),
			msg.sender,
			_to
		);
		_transfer(msg.sender, _to, _value);
		return true;
	}

	function withdrawDev(address _sender) public onlyLockup {
		uint256 value = Lockup(config().lockup()).getTokenValue(
			address(this),
			_sender
		);
		require(value != 0, "your token is 0");
		ERC20 devToken = ERC20(config().token());
		devToken.transfer(_sender, value);
	}
}
