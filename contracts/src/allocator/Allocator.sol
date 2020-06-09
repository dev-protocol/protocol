pragma solidity ^0.5.0;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {IAllocator} from "contracts/src/allocator/IAllocator.sol";
import {Decimals} from "contracts/src/common/libs/Decimals.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {Market} from "contracts/src/market/Market.sol";
import {IMarketBehavior} from "contracts/src/market/IMarketBehavior.sol";
import {Metrics} from "contracts/src/metrics/Metrics.sol";
import {MetricsGroup} from "contracts/src/metrics/MetricsGroup.sol";
import {VoteTimes} from "contracts/src/vote/times/VoteTimes.sol";
import {Withdraw} from "contracts/src/withdraw/Withdraw.sol";
import {Policy} from "contracts/src/policy/Policy.sol";
import {Lockup} from "contracts/src/lockup/Lockup.sol";
import {AllocatorStorage} from "contracts/src/allocator/AllocatorStorage.sol";

contract Allocator is Pausable, UsingConfig, IAllocator, UsingValidator {
	using SafeMath for uint256;
	using Decimals for uint256;

	uint64 public constant basis = 1000000000000000000;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function calculate(address _property)
		public
		view
		returns (uint256 holders, uint256 interest)
	{
		addressValidator().validateGroup(_property, config().propertyGroup());

		uint256 totalAssets = MetricsGroup(config().metricsGroup())
			.totalIssuedMetrics();
		uint256 lockedUps = Lockup(config().lockup()).getPropertyValue(
			_property
		);
		uint256 totalLockedUps = Lockup(config().lockup()).getAllValue();
		uint256 lastBlock = getStorage().getLastBlockNumber(_property);
		uint256 blocks = block.number.sub(lastBlock);
		blocks = blocks > 0 ? blocks : 1;
		uint256 mint = Policy(config().policy()).rewards(
			totalLockedUps,
			totalAssets
		);
		uint256 result = allocation(blocks, mint, lockedUps, totalLockedUps);
		uint256 holders = Policy(config().policy()).holdersShare(
			result,
			lockedUps
		);
		uint256 interest = _reward.sub(holders);
		return (holders, interest);
	}

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
	) external {
		addressValidator().validateGroup(msg.sender, config().propertyGroup());

		Withdraw(config().withdraw()).beforeBalanceChange(
			_property,
			_from,
			_to
		);
	}

	function getRewardsAmount(address _property)
		external
		view
		returns (uint256)
	{
		return Withdraw(config().withdraw()).getRewardsAmount(_property);
	}

	function allocation(
		uint256 _blocks,
		uint256 _mint,
		uint256 _lockedUps,
		uint256 _totalLockedUps
	) public pure returns (uint256) {
		uint256 lShare = _totalLockedUps > 0
			? _lockedUps.outOf(_totalLockedUps)
			: Decimals.basis();
		uint256 mint = _mint.mul(_blocks);
		return mint.mul(lShare).div(Decimals.basis());
	}

	function validateTargetPeriod(address _metrics) private {
		address property = Metrics(_metrics).property();
		VoteTimes voteTimes = VoteTimes(config().voteTimes());
		uint256 abstentionCount = voteTimes.getAbstentionTimes(property);
		uint256 notTargetPeriod = Policy(config().policy()).abstentionPenalty(
			abstentionCount
		);
		if (notTargetPeriod == 0) {
			return;
		}
		uint256 blockNumber = getLastAllocationBlockNumber(_metrics);
		uint256 notTargetBlockNumber = blockNumber.add(notTargetPeriod);
		require(
			notTargetBlockNumber < block.number,
			"outside the target period"
		);
		getStorage().setLastBlockNumber(_metrics, notTargetBlockNumber);
		voteTimes.resetVoteTimesByProperty(property);
	}

	function getStorage() private view returns (AllocatorStorage) {
		require(paused() == false, "You cannot use that");
		return AllocatorStorage(config().allocatorStorage());
	}
}
