pragma solidity ^0.5.0;

import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";

contract VoteCounterStorage is UsingStorage {
	// Already Vote Market
	function setStorageAlreadyVoteMarket(
		address _user,
		address _market,
		address _property
	) internal {
		bytes32 key = getStorageAlreadyVoteMarketKey(_user, _market, _property);
		eternalStorage().setBool(key, true);
	}

	function getStorageAlreadyVoteMarket(
		address _user,
		address _market,
		address _property
	) public view returns (bool) {
		bytes32 key = getStorageAlreadyVoteMarketKey(_user, _market, _property);
		return eternalStorage().getBool(key);
	}

	function getStorageAlreadyVoteMarketKey(
		address _user,
		address _market,
		address _property
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					"_alreadyVoteMarket",
					_user,
					_market,
					_property
				)
			);
	}

	// Already Use Property
	function setStorageAlreadyUseProperty(
		address _user,
		address _property,
		uint256 _votingGroupIndex,
		bool _flg
	) internal {
		bytes32 key = getStorageAlreadyUsePropertyKey(
			_user,
			_property,
			_votingGroupIndex
		);
		eternalStorage().setBool(key, _flg);
	}

	function getStorageAlreadyUseProperty(
		address _user,
		address _property,
		uint256 _votingGroupIndex
	) public view returns (bool) {
		bytes32 key = getStorageAlreadyUsePropertyKey(
			_user,
			_property,
			_votingGroupIndex
		);
		return eternalStorage().getBool(key);
	}

	function getStorageAlreadyUsePropertyKey(
		address _user,
		address _property,
		uint256 _votingGroupIndex
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					"_alreadyUseProperty",
					_user,
					_property,
					_votingGroupIndex
				)
			);
	}

	// Already Vote Policy
	function setStorageAlreadyVotePolicy(
		address _user,
		address _property,
		uint256 _votingGroupIndex,
		bool _flg
	) internal {
		bytes32 key = getStorageAlreadyVotePolicyKey(
			_user,
			_property,
			_votingGroupIndex
		);
		eternalStorage().setBool(key, _flg);
	}

	function getStorageAlreadyVotePolicy(
		address _user,
		address _property,
		uint256 _votingGroupIndex
	) public view returns (bool) {
		bytes32 key = getStorageAlreadyVotePolicyKey(
			_user,
			_property,
			_votingGroupIndex
		);
		return eternalStorage().getBool(key);
	}

	function getStorageAlreadyVotePolicyKey(
		address _user,
		address _property,
		uint256 _votingGroupIndex
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					"_alreadyVotePolicy",
					_user,
					_property,
					_votingGroupIndex
				)
			);
	}

	// Policy Vote Count
	function setStoragePolicyVoteCount(
		address _user,
		address _policy,
		bool _agree,
		uint256 _count
	) internal {
		bytes32 key = getStoragePolicyVoteCountKey(_user, _policy, _agree);
		eternalStorage().setUint(key, _count);
	}

	function getStoragePolicyVoteCount(
		address _user,
		address _policy,
		bool _agree
	) public view returns (uint256) {
		bytes32 key = getStoragePolicyVoteCountKey(_user, _policy, _agree);
		return eternalStorage().getUint(key);
	}

	function getStoragePolicyVoteCountKey(
		address _user,
		address _policy,
		bool _agree
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked("_policyVoteCount", _user, _policy, _agree)
			);
	}

	// Agree Count
	function setStorageAgreeCount(address _sender, uint256 count) internal {
		eternalStorage().setUint(getStorageAgreeVoteCountKey(_sender), count);
	}

	function getStorageAgreeCount(address _sender)
		public
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getStorageAgreeVoteCountKey(_sender));
	}

	function getStorageAgreeVoteCountKey(address _sender)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_sender, "_agreeVoteCount"));
	}

	// Opposite Count
	function setStorageOppositeCount(address _sender, uint256 count) internal {
		eternalStorage().setUint(
			getStorageOppositeVoteCountKey(_sender),
			count
		);
	}

	function getStorageOppositeCount(address _sender)
		public
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(getStorageOppositeVoteCountKey(_sender));
	}

	function getStorageOppositeVoteCountKey(address _sender)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_sender, "_oppositeVoteCount"));
	}
}
