pragma solidity ^0.5.0;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {VoteCounterStorage} from "contracts/src/vote/VoteCounterStorage.sol";
import {IPolicy} from "contracts/src/policy/IPolicy.sol";
import {ILockup} from "contracts/src/lockup/ILockup.sol";
import {IMarket} from "contracts/src/market/IMarket.sol";
import {IVoteCounter} from "contracts/src/vote/IVoteCounter.sol";
import {IPolicyGroup} from "contracts/src/policy/IPolicyGroup.sol";
import {IPolicyFactory} from "contracts/src/policy/IPolicyFactory.sol";

/**
 * A contract that manages the activation votes for new markets and new policies.
 * Voting rights of voters are determined by the staking amount to a Property.
 * That is, at the voting, expecting to pass a Property address for specification the voting right.
 * Market voting is an election that selects out all that voters think is good.
 * Policy voting is an election to select one that seems to be the best with Quadratic Voting.
 * Quadratic Voting is realized by exercising multiple voting rights in Policy voting.
 */
contract VoteCounter is
	IVoteCounter,
	UsingConfig,
	UsingValidator,
	VoteCounterStorage
{
	using SafeMath for uint256;

	/**
	 * Initialize the passed address as AddressConfig address.
	 */
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	/**
	 * Votes for or against new Market
	 */
	function voteMarket(
		address _market,
		address _property,
		bool _agree
	) external {
		/**
		 * Validates the passed Market address is included the Market address set
		 */
		addressValidator().validateGroup(_market, config().marketGroup());

		/**
		 * Validates the passed Market is still not enabled
		 */
		IMarket market = IMarket(_market);
		require(market.enabled() == false, "market is already enabled");

		/**
		 * Validates the voting deadline has not passed.
		 */
		require(
			block.number <= market.votingEndBlockNumber(),
			"voting deadline is over"
		);

		/**
		 * Gets the staking amount for the passed Property as a voting right.
		 * If the voting right is 0, it cannot vote.
		 */
		uint256 count = ILockup(config().lockup()).getValue(
			_property,
			msg.sender
		);
		require(count != 0, "vote count is 0");

		/**
		 * Validates it does not become a double vote.
		 */
		bool alreadyVote = getStorageAlreadyVoteMarket(
			msg.sender,
			_market,
			_property
		);
		require(alreadyVote == false, "already vote");

		/**
		 * Votes
		 */
		vote(_market, count, _agree);

		/**
		 * Records voting status to avoid double voting.
		 */
		setStorageAlreadyVoteMarket(msg.sender, _market, _property);

		/**
		 * Gets the votes for and against and gets whether or not the threshold
		 * for enabling the Market is exceeded.
		 */
		bool result = IPolicy(config().policy()).marketApproval(
			getStorageAgreeCount(_market),
			getStorageOppositeCount(_market)
		);

		/**
		 * If the result is false, the process ends.
		 */
		if (result == false) {
			return;
		}

		/**
		 * If the result is true, to enable the passed Market.
		 */
		market.toEnable();
	}

	function isAlreadyVoteMarket(address _target, address _property)
		external
		view
		returns (bool)
	{
		return getStorageAlreadyVoteMarket(msg.sender, _target, _property);
	}

	/**
	 * Votes for or against new Policy
	 */
	function votePolicy(
		address _policy,
		address _property,
		bool _agree
	) external {
		/**
		 * Validates the passed Policy address is included the Policy address set
		 */
		addressValidator().validateGroup(_policy, config().policyGroup());

		/**
		 * Validates the passed Policy is not the current Policy.
		 */
		require(config().policy() != _policy, "this policy is current");

		/**
		 * Validates the voting deadline has not passed.
		 */
		IPolicyGroup policyGroup = IPolicyGroup(config().policyGroup());
		require(policyGroup.voting(_policy), "voting deadline is over");

		/**
		 * Validates it does not become a double vote.
		 * In a Policy vote, the Property used to vote for one of the Policies with the same voting period cannot be reused.
		 */
		uint256 votingGroupIndex = policyGroup.getVotingGroupIndex();
		bool alreadyVote = getStorageAlreadyUseProperty(
			msg.sender,
			_property,
			votingGroupIndex
		);
		require(alreadyVote == false, "already use property");

		/**
		 * Validates it does not become a double vote.
		 */
		alreadyVote = getStorageAlreadyVotePolicy(
			msg.sender,
			_policy,
			votingGroupIndex
		);
		require(alreadyVote == false, "already vote policy");

		/**
		 * Gets the staking amount for the passed Property as a voting right.
		 * If the voting right is 0, it cannot vote.
		 */
		uint256 count = ILockup(config().lockup()).getValue(
			_property,
			msg.sender
		);
		require(count != 0, "vote count is 0");

		/**
		 * Votes
		 */
		vote(_policy, count, _agree);

		/**
		 * Records voting status to avoid double voting.
		 */
		setStorageAlreadyUseProperty(
			msg.sender,
			_property,
			votingGroupIndex,
			true
		);
		setStorageAlreadyVotePolicy(
			msg.sender,
			_policy,
			votingGroupIndex,
			true
		);

		/**
		 * Records the used number of voting rights.
		 * The Policy vote is an election to select one, so voters can cancel an existing vote if voters think a later Policy is better.
		 */
		setStoragePolicyVoteCount(msg.sender, _policy, _agree, count);

		/**
		 * Gets the votes for and against and gets whether or not the threshold
		 * for enabling the Policy is exceeded.
		 */
		bool result = IPolicy(config().policy()).policyApproval(
			getStorageAgreeCount(_policy),
			getStorageOppositeCount(_policy)
		);

		/**
		 * If the result is false, the process ends.
		 */
		if (result == false) {
			return;
		}

		/**
		 * If the result is true, to enable the passed Policy.
		 */
		IPolicyFactory policyFactory = IPolicyFactory(config().policyFactory());
		policyFactory.convergePolicy(_policy);
	}

	/**
	 * Cancel voting for Policy
	 */
	function cancelVotePolicy(address _policy, address _property) external {
		/**
		 * Validates the passed Policy has already been voted using the passed Property.
		 */
		IPolicyGroup policyGroup = IPolicyGroup(config().policyGroup());
		uint256 votingGroupIndex = policyGroup.getVotingGroupIndex();
		bool alreadyVote = getStorageAlreadyUseProperty(
			msg.sender,
			_property,
			votingGroupIndex
		);
		require(alreadyVote, "not use property");

		/**
		 * Validates the passed Policy has already been voted.
		 */
		alreadyVote = getStorageAlreadyVotePolicy(
			msg.sender,
			_policy,
			votingGroupIndex
		);
		require(alreadyVote, "not vote policy");

		/**
		 * Gets the number of for or against votes the sender has voted.
		 */
		bool agree = true;
		uint256 count = getStoragePolicyVoteCount(msg.sender, _policy, agree);
		if (count == 0) {
			agree = false;
			count = getStoragePolicyVoteCount(msg.sender, _policy, agree);

			/**
			 * Validates the voting rights are not 0.
			 */
			require(count != 0, "not vote policy");
		}

		/**
		 * Subtracts the exercised voting rights to cancel the vote.
		 */
		cancelVote(_policy, count, agree);

		/**
		 * Sets the exercised voting rights to 0.
		 */
		setStoragePolicyVoteCount(msg.sender, _policy, agree, 0);

		/**
		 * Deletes a Property as voting rights and the exercise record.
		 */
		setStorageAlreadyUseProperty(
			msg.sender,
			_property,
			votingGroupIndex,
			false
		);
		setStorageAlreadyVotePolicy(
			msg.sender,
			_policy,
			votingGroupIndex,
			false
		);
	}

	/**
	 * Exercises voting rights.
	 */
	function vote(
		address _target,
		uint256 count,
		bool _agree
	) private {
		if (_agree) {
			/**
			 * For:
			 */
			addAgreeCount(_target, count);
		} else {
			/**
			 * Against:
			 */
			addOppositeCount(_target, count);
		}
	}

	/**
	 * Subtracts the exercised voting rights to cancel the vote.
	 */
	function cancelVote(
		address _target,
		uint256 count,
		bool _agree
	) private {
		if (_agree) {
			/**
			 * Cancel the yes:
			 */
			subAgreeCount(_target, count);
		} else {
			/**
			 * Cancel the against:
			 */
			subOppositeCount(_target, count);
		}
	}

	/**
	 * Adds voting rights exercised as for.
	 */
	function addAgreeCount(address _target, uint256 _voteCount) private {
		uint256 agreeCount = getStorageAgreeCount(_target);
		agreeCount = agreeCount.add(_voteCount);
		setStorageAgreeCount(_target, agreeCount);
	}

	/**
	 * Adds voting rights exercised as against.
	 */
	function addOppositeCount(address _target, uint256 _voteCount) private {
		uint256 oppositeCount = getStorageOppositeCount(_target);
		oppositeCount = oppositeCount.add(_voteCount);
		setStorageOppositeCount(_target, oppositeCount);
	}

	/**
	 * Subtracts voting rights exercised as for.
	 */
	function subAgreeCount(address _target, uint256 _voteCount) private {
		uint256 agreeCount = getStorageAgreeCount(_target);
		agreeCount = agreeCount.sub(_voteCount);
		setStorageAgreeCount(_target, agreeCount);
	}

	/**
	 * Subtracts voting rights exercised as against.
	 */
	function subOppositeCount(address _target, uint256 _voteCount) private {
		uint256 oppositeCount = getStorageOppositeCount(_target);
		oppositeCount = oppositeCount.sub(_voteCount);
		setStorageOppositeCount(_target, oppositeCount);
	}
}
