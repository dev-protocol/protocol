pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "./libs/Killable.sol";
import "./libs/Withdrawable.sol";
import "./market/Market.sol";
import "./metrics/Metrics.sol";
import "./metrics/MetricsGroup.sol";
import "./policy/PolicyFactory.sol";
import "./LastAllocationTime.sol";
import "./Lockup.sol";

contract Allocator is Killable, Ownable, UsingConfig, Withdrawable {
	using SafeMath for uint256;

	mapping(address => uint256) lastAllocationBlockEachMetrics;
	mapping(address => uint256) lastAllocationValueEachMetrics;
	uint256 public lastTotalAllocationValuePerBlock;

	mapping(address => bool) pendingIncrements;
	LastAllocationTime private lastAllocationTime;

	constructor(address _config) public UsingConfig(_config) {
		lastAllocationTime = new LastAllocationTime();
	}

	function setSecondsPerBlock(uint256 _sec) public onlyOwner {
		lastAllocationTime.setSecondsPerBlock(_sec);
	}

	function allocate(address _metrics) public payable {
		// TODO Add penalty judgment processing
		// https://github.com/dev-protocol/protocol/blob/master/docs/WHITEPAPER.JA.md#abstentionpenalty
		require(
			MetricsGroup(config().metricsGroup()).isMetrics(_metrics),
			"Is't Metrics Contract"
		);
		(uint256 timestamp, uint256 yesterday) = lastAllocationTime
			.getTimeInfo();
		lastAllocationTime.ensureDiffDays(_metrics, yesterday);
		address market = Metrics(_metrics).market();
		pendingIncrements[_metrics] = true;
		Market(market).calculate(
			_metrics,
			lastAllocationTime.getLastAllocationTime(_metrics),
			yesterday
		);
		lastAllocationTime.setLastAllocationTime(_metrics, timestamp);
	}

	function calculatedCallback(address _metrics, uint256 _value) public {
		Metrics metrics = Metrics(_metrics);
		Market market = Market(metrics.market());
		require(
			msg.sender == market.behavior(),
			"Don't call from other than Market Behavior"
		);
		require(
			pendingIncrements[_metrics] == true,
			"Not asking for an indicator"
		);
		Policy policy = Policy(config().policy());
		Lockup lockup = Lockup(config().lockup());
		uint256 totalIssuedMetrics = MetricsGroup(config().metricsGroup())
			.totalIssuedMetrics();
		uint256 share = market.issuedMetrics() / totalIssuedMetrics;
		uint256 period = block.number -
			lastAllocationBlockEachMetrics[_metrics];
		uint256 lockupValue = lockup.getTokenValueByProperty(
			metrics.property()
		);
		uint256 allocationPerBlock = policy.assetValue(lockupValue, _value) /
			period;
		uint256 nextTotalAllocationValuePerBlock = lastTotalAllocationValuePerBlock -
			lastAllocationValueEachMetrics[_metrics] +
			allocationPerBlock;
		uint256 allocation = allocationPerBlock /
			nextTotalAllocationValuePerBlock *
			policy.rewards(lockupValue, totalIssuedMetrics) *
			share *
			period;
		lastAllocationBlockEachMetrics[_metrics] = block.number;
		lastAllocationValueEachMetrics[_metrics] = allocationPerBlock;
		lastTotalAllocationValuePerBlock = nextTotalAllocationValuePerBlock;
		increment(metrics.property(), allocation);
		delete pendingIncrements[_metrics];
	}
}
