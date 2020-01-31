pragma solidity ^0.5.0;


contract IPolicy {
	function rewards(uint256 _lockups, uint256 _assets)
		external
		view
		returns (uint256);

	function holdersShare(uint256 _amount, uint256 _lockups)
		external
		view
		returns (uint256);

	function assetValue(uint256 _value, uint256 _lockups)
		external
		view
		returns (uint256);

	function authenticationFee(uint256 _assets, uint256 _propertyAssets)
		external
		view
		returns (uint256);

	function marketApproval(uint256 _agree, uint256 _opposite)
		external
		view
		returns (bool);

	function policyApproval(uint256 _agree, uint256 _opposite)
		external
		view
		returns (bool);

	function marketVotingBlocks() external view returns (uint256);

	function policyVotingBlocks() external view returns (uint256);

	function abstentionPenalty(uint256 _count) external view returns (uint256);

	function lockUpBlocks() external view returns (uint256);
}
