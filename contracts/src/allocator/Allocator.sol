pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../common/lifecycle/Killable.sol";
import "../common/libs/Decimals.sol";
import "../common/validate/AddressValidator.sol";
import "../common/config/UsingConfig.sol";
import "../market/Market.sol";
import "../metrics/Metrics.sol";
import "../metrics/MetricsGroup.sol";
import "../policy/PolicyFactory.sol";
import "../vote/VoteTimes.sol";
import "../lockup/Lockup.sol";
import "../withdraw/Withdraw.sol";
import "./AllocationBlockNumber.sol";
import "./PendingIncrement.sol";

contract Allocator is Killable, Ownable, UsingConfig {
	using SafeMath for uint256;
	using Decimals for uint256;

	mapping(address => uint256) lastAllocationBlockEachMetrics;
	mapping(address => uint256) lastAssetValueEachMetrics;
	mapping(address => uint256) lastAssetValueEachMarketPerBlock;
	uint64 private constant basis = 1000000000000000000;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function allocate(address _metrics) external payable {
		new AddressValidator().validateGroup(_metrics, config().metricsGroup());

		validateTargetPeriod(_metrics);
		address market = Metrics(_metrics).market();
		PendingIncrement(config().pendingIncrement()).set(_metrics);
		AllocationBlockNumber allocationBlockNumber = AllocationBlockNumber(
			config().allocationBlockNumber()
		);
		Market(market).calculate(
			_metrics,
			getLastAllocationBlockNumber(_metrics),
			block.number
		);
		allocationBlockNumber.setWithNow(_metrics);
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
			PendingIncrement(config().pendingIncrement()).isPending(_metrics),
			"not asking for an indicator"
		);
		Policy policy = Policy(config().policy());
		uint256 totalAssets = MetricsGroup(config().metricsGroup())
			.totalIssuedMetrics();
		uint256 lockupValue = Lockup(config().lockup()).getPropertyValue(
			metrics.property()
		);
		uint256 blocks = block.number -
			lastAllocationBlockEachMetrics[_metrics];
		uint256 mint = policy.rewards(lockupValue, totalAssets);
		uint256 value = policy.assetValue(lockupValue, _value) * basis / blocks;
		uint256 marketValue = lastAssetValueEachMarketPerBlock[metrics
				.market()] -
			lastAssetValueEachMetrics[_metrics] +
			value;
		uint256 assets = market.issuedMetrics();
		lastAllocationBlockEachMetrics[_metrics] = block.number;
		lastAssetValueEachMetrics[_metrics] = value;
		lastAssetValueEachMarketPerBlock[metrics.market()] = marketValue;
		uint256 result = allocation(
			blocks,
			mint,
			value,
			marketValue,
			assets,
			totalAssets
		);
		Withdraw(config().withdraw()).increment(metrics.property(), result);
		PendingIncrement(config().pendingIncrement()).unset(_metrics);
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
		(uint256 aShare, uint256 aBasis) = _assets.outOf(_totalAssets);
		(uint256 vShare, uint256 vBasis) = _value.outOf(_marketValue);
		uint256 mint = _mint.mul(_blocks);
		return mint.mul(aShare).mul(vShare).div(aBasis).div(vBasis);
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
		AllocationBlockNumber allocationBlockNumber = AllocationBlockNumber(
			config().allocationBlockNumber()
		);
		uint256 blockNumber = getLastAllocationBlockNumber(_metrics);
		uint256 notTargetBlockNumber = blockNumber + notTargetPeriod;
		require(
			notTargetBlockNumber < block.number,
			"outside the target period"
		);
		allocationBlockNumber.set(_metrics, notTargetBlockNumber);
		voteTimes.resetVoteTimesByProperty(property);
	}

	function getLastAllocationBlockNumber(address _metrics)
		private
		returns (uint256)
	{
		AllocationBlockNumber allocationBlockNumber = AllocationBlockNumber(
			config().allocationBlockNumber()
		);
		uint256 blockNumber = allocationBlockNumber.getLastBlockNumber(_metrics);
		uint256 baseBlockNumber = allocationBlockNumber.getBaseBlockNumber();
		if (baseBlockNumber == 0){
			allocationBlockNumber.setBaseBlockNumber();
		}
		uint256 lastAllocationBlockNumber = blockNumber > 0
			? blockNumber
			: allocationBlockNumber.getBaseBlockNumber();
		return lastAllocationBlockNumber;
	}
}
