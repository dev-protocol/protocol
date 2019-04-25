pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol';

contract Repository is ERC20, ERC20Detailed {
	string public package;

	constructor(
		string memory _package,
		string memory name,
		string memory symbol,
		uint8 decimals,
		uint supply
	) public ERC20Detailed(name, symbol, decimals) {
		package = _package;
		_mint(msg.sender, supply);
	}

	function getPackage() public view returns (string memory) {
		return package;
	}
}
