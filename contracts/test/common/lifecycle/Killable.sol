pragma solidity ^0.5.0;

import {Killable} from "contracts/src/common/lifecycle/Killable.sol";

// solium-disable-next-line no-empty-blocks
contract KillableTest is Killable {
	function getValue() external pure returns (uint256) {
		return 1;
	}
}
