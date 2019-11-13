pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract ERC20Transfer {
	ERC20 private token;
	constructor(address _contractAddress) public {
		token = ERC20(_contractAddress);
	}

	function transfer(address _to, uint256 _value) public {
		uint256 balance = token.balanceOf(msg.sender);
		require(_value <= balance, "insufficient balance");
		token.transfer(_to, _value);
	}
}
