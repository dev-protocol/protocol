pragma solidity ^0.5.0;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {VoteCounterStorage} from "contracts/src/vote/VoteCounterStorage.sol";
import {Policy} from "contracts/src/policy/Policy.sol";
import {IProperty} from "contracts/src/property/IProperty.sol";
import {ILockup} from "contracts/src/lockup/ILockup.sol";
import {IMarket} from "contracts/src/market/IMarket.sol";
import {IVoteCounter} from "contracts/src/vote/IVoteCounter.sol";
import {IWithdraw} from "contracts/src/withdraw/IWithdraw.sol";
import {IPolicyFactory} from "contracts/src/policy/IPolicyFactory.sol";

contract VoteCounter is
	IVoteCounter,
	UsingConfig,
	UsingValidator,
	VoteCounterStorage
{
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function voteMarket(
		address _target,
		address[] calldata _properties,
		bool _agree
	) external {
		addressValidator().validateGroup(_target, config().marketGroup());
		IMarket market = IMarket(_target);
		require(market.enabled() == false, "market is already enabled");
		require(
			block.number <= market.votingEndBlockNumber(),
			"voting deadline is over"
		);
		uint256 count = getAllPropertyVoteCount(_properties);
		require(count != 0, "vote count is 0");
		vote(_target, count, _agree);
		bool result = Policy(config().policy()).marketApproval(
			getStorageAgreeCount(_target),
			getStorageOppositeCount(_target)
		);
		if (result == false) {
			return;
		}
		market.toEnable();
	}

	function votePolicy(
		address _target,
		address _property,
		bool _agree
	) external {
		addressValidator().validateGroup(_target, config().policyGroup());
		require(config().policy() != _target, "this policy is current");
		IPolicyFactory policyfactory = IPolicyFactory(config().policyFactory());
		uint256 votingGroupIndex = policyfactory.getVotingGroupIndex();
		bool alreadyVote = getStorageAlreadyUsePropertyFlg(msg.sender, _property, votingGroupIndex);
		require(alreadyVote == false, "already use property");
		Policy policy = Policy(_target);
		require(policy.voting(), "voting deadline is over");
		uint256 count = getVoteCountByProperty(msg.sender, _property);
		require(count != 0, "vote count is 0");
		vote(_target, count, _agree);
		setStorageAlreadyUsePropertyFlg(msg.sender, _property, votingGroupIndex);
		bool result = Policy(config().policy()).policyApproval(
			getStorageAgreeCount(_target),
			getStorageOppositeCount(_target)
		);
		if (result == false) {
			return;
		}
		policyfactory.convergePolicy(_target);
	}

	// TODO アドレスを渡せば渡すほどガス代が多くなるか確認する
	function vote(
		address _target,
		uint256 count,
		bool _agree
	) private {
		bool alreadyVote = getStorageAlreadyVoteFlg(msg.sender, _target);
		require(alreadyVote == false, "already vote");
		setStorageAlreadyVoteFlg(msg.sender, _target);
		if (_agree) {
			addAgreeCount(_target, count);
		} else {
			addOppositeCount(_target, count);
		}
	}

	function getTargetAllVoteCount(address _target)
		external
		view
		returns (uint256)
	{
		return
			getStorageAgreeCount(_target).add(getStorageOppositeCount(_target));
	}

	function isAlreadyVote(address _target) external view returns (bool) {
		return getStorageAlreadyVoteFlg(msg.sender, _target);
	}

	function getAllPropertyVoteCount(address[] memory _properties)
		public
		view
		returns (uint256)
	{
		uint256 count = 0;
		for (uint256 i = 0; i < _properties.length; i++) {
			uint256 tmp = getVoteCountByProperty(msg.sender, _properties[i]);
			count.add(tmp);
		}
		return count;
	}

	function getVoteCount(address property) external view returns (uint256) {
		return getVoteCountByProperty(msg.sender, property);
	}

	function getVoteCountByProperty(address _sender, address property)
		private
		view
		returns (uint256)
	{
		require(
			_sender == IProperty(property).author(),
			"illegal property address"
		);
		return ILockup(config().lockup()).getValue(property, _sender);
	}

	function addAgreeCount(address _target, uint256 _voteCount) private {
		uint256 agreeCount = getStorageAgreeCount(_target);
		agreeCount = agreeCount.add(_voteCount);
		setStorageAgreeCount(_target, agreeCount);
	}

	function addOppositeCount(address _target, uint256 _voteCount) private {
		uint256 oppositeCount = getStorageOppositeCount(_target);
		oppositeCount = oppositeCount.add(_voteCount);
		setStorageOppositeCount(_target, oppositeCount);
	}
}
