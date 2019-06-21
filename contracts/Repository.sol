pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./UseState.sol";
import "./Distributor.sol";

contract Repository is ERC20, ERC20Detailed, Ownable, UseState {
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

	function transfer(address to, uint256 value) public returns (bool) {
		address distributor = getDistributor();
		Distributor(distributor).beforeBalanceChange(
			address(this),
			msg.sender,
			to
		);
		_transfer(msg.sender, to, value);
		return true;
	}
}
