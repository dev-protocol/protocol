pragma solidity 0.5.17;

import {PolicyTestBase} from "contracts/test/policy/PolicyTestBase.sol";

contract PolicyTestForAllocator is PolicyTestBase {
	uint256 private _lockUpBlocks = 1;

	function rewards(uint256 _lockups, uint256 _assets)
		external
		view
		returns (uint256)
	{
		return _assets > 0 ? _lockups : 0;
	}

	function holdersShare(uint256 _amount, uint256 _lockups)
		external
		view
		returns (uint256)
	{
		return _lockups > 0 ? (_amount * 90) / 100 : _amount;
	}

	function authenticationFee(uint256 _assets, uint256 _propertyLockups)
		external
		view
		returns (uint256)
	{
		return _assets + _propertyLockups + 1;
	}

	function lockUpBlocks() external view returns (uint256) {
		return _lockUpBlocks;
	}

	function setLockUpBlocks(uint256 _blocks) public {
		_lockUpBlocks = _blocks;
	}
}
