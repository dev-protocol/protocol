pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract TestErc20Token is ERC20 {
	string public name = "TestErc20Token";
	string public symbol = "T20T";
	uint256 public decimals = 18;
	constructor() public {
		_mint(msg.sender, 100000000);
	}
}
