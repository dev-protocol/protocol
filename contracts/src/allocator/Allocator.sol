pragma solidity ^0.5.0;

import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import {SafeMath} from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import {ERC20Mintable} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import {IAllocator} from "contracts/src/allocator/IAllocator.sol";
import {Killable} from "contracts/src/common/lifecycle/Killable.sol";
import {Decimals} from "contracts/src/common/libs/Decimals.sol";
import {AddressValidator} from "contracts/src/common/validate/AddressValidator.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {Market} from "contracts/src/market/Market.sol";
import {Metrics} from "contracts/src/metrics/Metrics.sol";
import {MetricsGroup} from "contracts/src/metrics/MetricsGroup.sol";
import {VoteTimes} from "contracts/src/vote/times/VoteTimes.sol";
import {Withdraw} from "contracts/src/withdraw/Withdraw.sol";
import {Policy} from "contracts/src/policy/Policy.sol";
import {Lockup} from "contracts/src/lockup/Lockup.sol";
import {AllocatorStorage} from "contracts/src/allocator/AllocatorStorage.sol";

contract Allocator is Killable, Ownable, UsingConfig, IAllocator {
	using SafeMath for uint256;
	using Decimals for uint256;

	uint64 private constant basis = 1000000000000000000;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function allocate(address _metrics) external {
		new AddressValidator().validateGroup(_metrics, config().metricsGroup());

		validateTargetPeriod(_metrics);
		address market = Metrics(_metrics).market();
		getStorage().setPendingIncrement(_metrics, true);
		Market(market).calculate(
			_metrics,
			getLastAllocationBlockNumber(_metrics),
			block.number
		);
		getStorage().setLastBlockNumber(_metrics, block.number);
	}

	function calculatedCallback(address _metrics, uint256 _value) external {
		new AddressValidator().validateGroup(_metrics, config().metricsGroup());

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
		Policy policy = Policy(config().policy());
		uint256 totalAssets = MetricsGroup(config().metricsGroup())
			.totalIssuedMetrics();
		uint256 lockupValue = Lockup(config().lockup()).getPropertyValue(
			metrics.property()
		);
		uint256 blocks = block.number -
			getStorage().getLastAllocationBlockEachMetrics(_metrics);
		uint256 mint = policy.rewards(lockupValue, totalAssets);
		uint256 value = policy.assetValue(lockupValue, _value) * basis / blocks;
		uint256 marketValue = getStorage().getLastAssetValueEachMarketPerBlock(
				metrics.market()
			) -
			getStorage().getLastAssetValueEachMetrics(_metrics) +
			value;
		uint256 assets = market.issuedMetrics();
		getStorage().setLastAllocationBlockEachMetrics(_metrics, block.number);
		getStorage().setLastAssetValueEachMetrics(_metrics, value);
		getStorage().setLastAssetValueEachMarketPerBlock(
			metrics.market(),
			marketValue
		);
		uint256 result = allocation(
			blocks,
			mint,
			value,
			marketValue,
			assets,
			totalAssets
		);
		increment(metrics.property(), result, lockupValue);
		getStorage().setPendingIncrement(_metrics, false);
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
		new AddressValidator().validateGroup(
			msg.sender,
			config().propertyGroup()
		);

		Withdraw(config().withdraw()).beforeBalanceChange(
			_property,
			_from,
			_to
		);
	}

	function withdraw(address _property) external {
		new AddressValidator().validateGroup(
			_property,
			config().propertyGroup()
		);

		return Withdraw(config().withdraw()).withdraw(_property);
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
		uint256 aShare = _assets.outOf(_totalAssets);
		uint256 vShare = _value.outOf(_marketValue);
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
		uint256 notTargetBlockNumber = blockNumber + notTargetPeriod;
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
		return AllocatorStorage(config().allocatorStorage());
	}
}
