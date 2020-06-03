pragma solidity ^0.5.0;

import {DIP1} from "contracts/src/policy/DIP1.sol";

contract DIP3 is DIP1 {
	constructor(address _config) public DIP1(_config) {
		lockUpBlocks = 1;
	}
}
