// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface IVoteCounter {
	function voteMarket(
		address _market,
		address _property,
		bool _agree
	) external;

	function isAlreadyVoteMarket(address _target, address _property)
		external
		view
		returns (bool);

	function votePolicy(
		address _policy,
		address _property,
		bool _agree
	) external;

	function cancelVotePolicy(address _policy, address _property) external;
}
