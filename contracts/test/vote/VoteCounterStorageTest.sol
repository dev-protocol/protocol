pragma solidity ^0.5.0;

import {VoteCounterStorage} from "contracts/src/vote/VoteCounterStorage.sol";

contract VoteCounterStorageTest is VoteCounterStorage {
	function setStorageAlreadyVoteMarketTest(
		address _user,
		address _market,
		address _property
	) external {
		setStorageAlreadyVoteMarket(_user, _market, _property);
	}

	function setStorageAlreadyUsePropertyTest(
		address _user,
		address _property,
		uint256 _votingGroupIndex,
		bool _flg
	) external {
		setStorageAlreadyUseProperty(_user, _property, _votingGroupIndex, _flg);
	}

	function setStorageAlreadyVotePolicyTest(
		address _user,
		address _policy,
		uint256 _votingGroupIndex,
		bool _flg
	) external {
		setStorageAlreadyVotePolicy(_user, _policy, _votingGroupIndex, _flg);
	}

	function setStoragePolicyVoteCountTest(
		address _user,
		address _policy,
		bool _agree,
		uint256 _count
	) external {
		setStoragePolicyVoteCount(_user, _policy, _agree, _count);
	}

	function setStorageAgreeCountTest(address _target, uint256 count) external {
		setStorageAgreeCount(_target, count);
	}

	function setStorageOppositeCountTest(address _target, uint256 count)
		external
	{
		setStorageOppositeCount(_target, count);
	}
}
