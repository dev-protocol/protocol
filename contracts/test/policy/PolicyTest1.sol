pragma solidity 0.5.17;

import {PolicyTestBase} from "./PolicyTestBase.sol";
import {Decimals} from "../../src/common/libs/Decimals.sol";

contract PolicyTest1 is PolicyTestBase {
	using Decimals for uint256;

	function rewards(uint256 _lockups, uint256 _assets)
		external
		view
		returns (uint256)
	{
		return _lockups + _assets;
	}

	function holdersShare(uint256 _amount, uint256 _lockups)
		external
		view
		returns (uint256)
	{
		uint256 sum = _amount + _lockups;
		uint256 share = _lockups.outOf(sum);
		return _amount - (_amount * share).divBasis();
	}

	function authenticationFee(uint256 _assets, uint256 _propertyLockups)
		external
		view
		returns (uint256)
	{
		return _assets + _propertyLockups - 1;
	}
}
