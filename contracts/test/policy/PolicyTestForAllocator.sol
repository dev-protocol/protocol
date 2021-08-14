pragma solidity 0.5.17;

import {PolicyTestBase} from "./PolicyTestBase.sol";

contract PolicyTestForAllocator is PolicyTestBase {
	function rewards(uint256 _lockups, uint256 _assets)
		external
		view
		returns (uint256)
	{
		return _assets > 0 ? _lockups : 0;
	}
}
