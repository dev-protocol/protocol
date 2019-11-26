pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract IPolicy {
	using SafeMath for uint256;

	function rewards(uint256 _lockups, uint256 _assets)
		public
		returns (uint256);

	function holdersShare(uint256 _amount, uint256 _lockups)
		public
		returns (uint256);

	function assetValue(uint256 _value, uint256 _lockups)
		public
		returns (uint256);

	function authenticationFee(uint256 _assets, uint256 _propertyAssets)
		public
		returns (uint256);

	function marketApproval(uint256 _agree, uint256 _opposite)
		public
		returns (bool);

	function policyApproval(uint256 _agree, uint256 _opposite)
		public
		returns (bool);

	function marketVotingBlocks() public returns (uint256);

	function policyVotingBlocks() public returns (uint256);

	function abstentionPenalty(uint256 _count) public returns (uint256);

	function lockUpBlocks() public returns (uint256);
}
