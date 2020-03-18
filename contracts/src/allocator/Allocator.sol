pragma solidity ^0.5.0;

import {SafeMath} from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import {Pausable} from "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
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

	event BeforeAllocation(
		uint256 _blocks,
		uint256 _mint,
		uint256 _value,
		uint256 _marketValue,
		uint256 _assets,
		uint256 _totalAssets
	);
	event AllocationResult(
		address _metrics,
		uint256 _value,
		address _market,
		address _property,
		uint256 _lockupValue,
		uint256 _result
	);

	uint64 public constant basis = 1000000000000000000;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function allocate(address _metrics) external {
		addressValidator().validateGroup(_metrics, config().metricsGroup());

		validateTargetPeriod(_metrics);
		address market = Metrics(_metrics).market();
		getStorage().setPendingIncrement(_metrics, true);
		getStorage().setPendingLastBlockNumber(_metrics, block.number);
		IMarketBehavior(Market(market).behavior()).calculate(
			_metrics,
			getLastAllocationBlockNumber(_metrics),
			block.number
		);
	}

	function calculatedCallback(address _metrics, uint256 _value) external {
		addressValidator().validateGroup(_metrics, config().metricsGroup());

		Metrics metrics = Metrics(_metrics);
		Market market = Market(metrics.market());
		require(
			msg.sender == market.behavior(),
			"don't call from other than market behavior"
		);
		require(
			getStorage().getPendingIncrement(_metrics),
			"not asking for an indicator"
		);
		uint256 totalAssets = MetricsGroup(config().metricsGroup())
			.totalIssuedMetrics();
		uint256 lockupValue = Lockup(config().lockup()).getPropertyValue(
			metrics.property()
		);
		uint256 lastBlock = getStorage().getPendingLastBlockNumber(_metrics);
		uint256 blocks = lastBlock.sub(
			getLastAllocationBlockNumber(_metrics)
		);
		blocks = blocks > 0 ? blocks : 1;
		uint256 mint = Policy(config().policy()).rewards(
			Lockup(config().lockup()).getAllValue(),
			totalAssets
		);
		uint256 value = (
			Policy(config().policy()).assetValue(_value, lockupValue).mul(basis)
		)
			.div(blocks);
		uint256 marketValue = getStorage()
			.getLastAssetValueEachMarketPerBlock(metrics.market())
			.sub(getStorage().getLastAssetValueEachMetrics(_metrics))
			.add(value);
		uint256 assets = market.issuedMetrics();
		getStorage().setLastAssetValueEachMetrics(_metrics, value);
		getStorage().setLastAssetValueEachMarketPerBlock(
			metrics.market(),
			marketValue
		);
		emit BeforeAllocation(
			blocks,
			mint,
			value,
			marketValue,
			assets,
			totalAssets
		);
		uint256 result = allocation(
			blocks,
			mint,
			value,
			marketValue,
			assets,
			totalAssets
		);
		emit AllocationResult(
			_metrics,
			_value,
			metrics.market(),
			metrics.property(),
			lockupValue,
			result
		);
		increment(metrics.property(), result, lockupValue);
		getStorage().setPendingIncrement(_metrics, false);
		getStorage().setLastBlockNumber(_metrics, lastBlock);
	}

	function increment(address _property, uint256 _reward, uint256 _lockup)
		private
	{
		uint256 holders = Policy(config().policy()).holdersShare(
			_reward,
			_lockup
		);
		uint256 interest = _reward.sub(holders);
		Withdraw(config().withdraw()).increment(_property, holders);
		Lockup(config().lockup()).increment(_property, interest);
	}

	function beforeBalanceChange(address _property, address _from, address _to)
		external
	{
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
		uint256 _value,
		uint256 _marketValue,
		uint256 _assets,
		uint256 _totalAssets
	) public pure returns (uint256) {
		uint256 aShare = _totalAssets > 0
			? _assets.outOf(_totalAssets)
			: Decimals.basis();
		uint256 vShare = _marketValue > 0
			? _value.outOf(_marketValue)
			: Decimals.basis();
		uint256 mint = _mint.mul(_blocks);
		return
			mint.mul(aShare).mul(vShare).div(Decimals.basis()).div(
				Decimals.basis()
			);
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

	function getLastAllocationBlockNumber(address _metrics)
		private
		returns (uint256)
	{
		uint256 blockNumber = getStorage().getLastBlockNumber(_metrics);
		uint256 baseBlockNumber = getStorage().getBaseBlockNumber();
		if (baseBlockNumber == 0) {
			getStorage().setBaseBlockNumber(block.number);
		}
		uint256 lastAllocationBlockNumber = blockNumber > 0
			? blockNumber
			: getStorage().getBaseBlockNumber();
		return lastAllocationBlockNumber;
	}

	function getStorage() private view returns (AllocatorStorage) {
		require(paused() == false, "You cannot use that");
		return AllocatorStorage(config().allocatorStorage());
	}
}
