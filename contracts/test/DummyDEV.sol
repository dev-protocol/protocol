pragma solidity ^0.5.0;

import {ERC20Detailed} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import {ERC20Burnable} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

contract DummyDEV is ERC20Burnable, ERC20Detailed {
	constructor() public ERC20Detailed("Dev", "DEV", 18) {
		_mint(msg.sender, 11416661000000000000000000);
	}
	function burnFrom(address, uint256) public {
		revert("no implemented");
	}
}
