pragma solidity 0.5.17;

import {DIP1} from "contracts/src/policy/DIP1.sol";

/**
 * DIP3 is a contract that changes the `lockUpBlocks` of DIP1.
 */
contract DIP3 is DIP1 {
	constructor(address _config) public DIP1(_config) {
		lockUpBlocks = 1;
	}
}
