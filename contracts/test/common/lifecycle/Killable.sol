pragma solidity ^0.5.0;

import {Killable} from "contracts/src/common/lifecycle/Killable.sol";


contract KillableTest is Killable {
	function getValue() external pure returns (uint256) {
		return 1;
	}
}
