pragma solidity ^0.5.0;

import "./IPolicy.sol";

contract PolicyTest is IPolicy {
	function rewards(uint256 lockups, uint256 assets) public returns (uint256) {
		return lockups + assets;
	}

	function holdersShare(uint256 amount, uint256 lockups)
		public
		returns (uint256)
	{
		return amount + lockups;
	}

	function assetValue(uint256 value, uint256 lockups)
		public
		returns (uint256)
	{
		return value + lockups;
	}

	function authenticationFee(uint256 assets, uint256 propertyAssets)
		public
		returns (uint256)
	{
		return assets + propertyAssets;
	}

	function marketApproval(uint256 agree, uint256 opposite)
		public
		returns (bool)
	{
		return agree + opposite > 0;
	}

	function policyApproval(uint256 agree, uint256 opposite)
		public
		returns (bool)
	{
		return agree + opposite > 0;
	}

	function marketVotingBlocks() public returns (uint256) {
		return 10;
	}

	function policyVotingBlocks() public returns (uint256) {
		return 20;
	}

	function abstentionPenalty(uint256 count) public returns (bool) {
		return count > 0;
	}

	function lockUpBlocks() public returns (uint256) {
		return 1;
	}
}
