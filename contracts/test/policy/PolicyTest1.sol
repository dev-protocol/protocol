pragma solidity ^0.5.0;

import "contracts/src/policy/IPolicy.sol";
import "contracts/src/common/libs/Decimals.sol";

contract PolicyTest1 is IPolicy {
	using Decimals for uint256;

	function rewards(uint256 _lockups, uint256 _assets)
		public
		view
		returns (uint256)
	{
		return _lockups + _assets;
	}

	function holdersShare(uint256 _amount, uint256 _lockups)
		public
		view
		returns (uint256)
	{
		uint256 sum = _amount + _lockups;
		(uint256 share, uint256 basis) = _lockups.outOf(sum);
		return _amount - (_amount * share / basis);
	}

	function assetValue(uint256 _value, uint256 _lockups)
		public
		view
		returns (uint256)
	{
		return _value * _lockups;
	}

	function authenticationFee(uint256 _assets, uint256 _propertyLockups)
		public
		view
		returns (uint256)
	{
		return _assets + _propertyLockups - 1;
	}

	function marketApproval(uint256 _agree, uint256 _opposite)
		public
		view
		returns (bool)
	{
		if (_agree + _opposite < 10000) {
			return false;
		}
		return _agree > _opposite;
	}

	function policyApproval(uint256 _agree, uint256 _opposite)
		public
		view
		returns (bool)
	{
		if (_agree + _opposite < 10000) {
			return false;
		}
		return _agree > _opposite;
	}

	function marketVotingBlocks() public view returns (uint256) {
		return 10;
	}

	function policyVotingBlocks() public view returns (uint256) {
		return 20;
	}

	function abstentionPenalty(uint256 _count) public view returns (uint256) {
		return _count * 5760;
	}

	function lockUpBlocks() public view returns (uint256) {
		return 1;
	}
}
