pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "./UseState.sol";
import "./Allocator.sol";

contract Property is ERC20, Ownable, ERC20Detailed, UseState {
	constructor(
		string memory _name,
		string memory _symbol,
		uint8 _decimals,
		uint256 _supply
	) Ownable() public ERC20Detailed(_name, _symbol, _decimals){
		_mint(owner(), _supply);
	}

	function transfer(address _to, uint256 _value) public returns (bool) {
		Allocator(allocator()).beforeBalanceChange(
			address(this),
			msg.sender,
			_to
		);
		_transfer(msg.sender, _to, _value);
		return true;
	}

	function lockUp(uint256 value) public onlyOwner returns (bool) {
		Allocator(allocator()).lockUp(
			address(this),
			value
		);
		return true;
	}
}
