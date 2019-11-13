pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract PolicyInterface {
	using SafeMath for uint256;

	function rewards(uint256 lockups, uint256 assets)
		public
		pure
		returns (uint256);

	function holdersShare(uint256 amount, uint256 lockups)
		public
		pure
		returns (uint256);

	function assetValue(uint256 value, uint256 lockups)
		public
		pure
		returns (uint256);

	function authenticationFee(uint256 assets, uint256 propertyAssets)
		public
		pure
		returns (uint256);

	function marketApproval(uint256 agree, uint256 opposite)
		public
		pure
		returns (bool);

	function policyApproval(uint256 agree, uint256 opposite)
		public
		pure
		returns (bool);

	function marketVotingBlocks() public pure returns (uint256);

	function policyVotingBlocks() public pure returns (uint256);

	function abstentionPenalty(uint256 count) public pure returns (bool);

	function lockUpBlocks() public pure returns (uint256);
}
