pragma solidity ^0.5.0;

import {IPolicy} from "contracts/src/policy/IPolicy.sol";

contract PolicyTestForAllocator is IPolicy {
	function rewards(uint256 _lockups, uint256 _assets)
		external
		view
		returns (uint256)
	{
		return _lockups + _assets + 100000000000000000000;
	}

	function holdersShare(uint256 _amount, uint256 _lockups)
		external
		view
		returns (uint256)
	{
		return _lockups > 0 ? _amount * 90 / 100 : _amount;
	}

	function assetValue(uint256 _value, uint256 _lockups)
		external
		view
		returns (uint256)
	{
		uint v = _value > 0 ? _value : 1;
		uint u = _lockups > 0 ? _lockups : 1;
		return v * u;
	}

	function authenticationFee(uint256 _assets, uint256 _propertyLockups)
		external
		view
		returns (uint256)
	{
		return _assets + _propertyLockups + 1;
	}

	function marketApproval(uint256 _agree, uint256 _opposite)
		external
		view
		returns (bool)
	{
		if (_agree + _opposite < 10000) {
			return false;
		}
		return _agree > _opposite;
	}

	function policyApproval(uint256 _agree, uint256 _opposite)
		external
		view
		returns (bool)
	{
		if (_agree + _opposite < 10000) {
			return false;
		}
		return _agree > _opposite;
	}

	function marketVotingBlocks() external view returns (uint256) {
		return 10;
	}

	function policyVotingBlocks() external view returns (uint256) {
		return 20;
	}

	function abstentionPenalty(uint256 _count) external view returns (uint256) {
		return 0;
	}

	function lockUpBlocks() external view returns (uint256) {
		return 1;
	}
}
