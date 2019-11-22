pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "./libs/Killable.sol";
import "./libs/Withdrawable.sol";
import "./market/Market.sol";
import "./metrics/Metrics.sol";
import "./metrics/MetricsGroup.sol";
import "./policy/PolicyVoteCounter.sol";
import "./policy/PolicyFactory.sol";

contract Allocator is Killable, Ownable, UsingConfig, Withdrawable {
	using SafeMath for uint256;

	mapping(address => uint256) lastAllocationBlockEachMetrics;
	mapping(address => uint256) lastAllocationValueEachMetrics;
	uint256 public lastTotalAllocationValuePerBlock;

	mapping(address => bool) pendingIncrements;
	// TODO not set
	uint256 public mintPerBlock;
	AllocationBlockNumber private _allocationBlockNumber;

	constructor(address _config) public UsingConfig(_config) {
		_allocationBlockNumber = new AllocationBlockNumber();
	}

	function allocate(address _metrics) public payable {
		require(
			MetricsGroup(config().metricsGroup()).isMetrics(_metrics),
			"not metrics contract."
		);
		validateTargetPeriod(_metrics);
		address market = Metrics(_metrics).market();
		pendingIncrements[_metrics] = true;
		Market(market).calculate(
			_metrics,
			_allocationBlockNumber.getLastAllocationBlockNumber(_metrics),
			block.number
		);
		_allocationBlockNumber.setLastAllocationBlockNumber(_metrics);
	}

	function validateTargetPeriod(address _metrics) private {
		address property = Metrics(_metrics).property();
		PolicyVoteCounter counter = PolicyVoteCounter(
			config().policyVoteCounter()
		);
		uint256 abstentionCount = counter.getAbstentionCount(property);
		uint256 notTargetPeriod = Policy(config().policy()).abstentionPenalty(abstentionCount);
		if (notTargetPeriod == 0) {
			return;
		}
		uint256 blockNumber = _allocationBlockNumber
			.getLastAllocationBlockNumber(_metrics);
		uint256 notTargetBlockNumber = blockNumber + notTargetPeriod;
		require(
			notTargetBlockNumber < block.number,
			"outside the target period."
		);
		counter.resetVoteCountByProperty(property);
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
		address property = metrics.property();
		uint256 share = market.issuedMetrics() /
			MetricsGroup(config().metricsGroup()).totalIssuedMetrics();
		uint256 period = block.number -
			lastAllocationBlockEachMetrics[_metrics];
		uint256 allocationPerBlock = _value / period;
		uint256 nextTotalAllocationValuePerBlock = lastTotalAllocationValuePerBlock -
			lastAllocationValueEachMetrics[_metrics] +
			allocationPerBlock;
		uint256 allocation = allocationPerBlock /
			nextTotalAllocationValuePerBlock *
			mintPerBlock *
			share *
			period;
		lastAllocationBlockEachMetrics[_metrics] = block.number;
		lastAllocationValueEachMetrics[_metrics] = allocationPerBlock;
		lastTotalAllocationValuePerBlock = nextTotalAllocationValuePerBlock;
		increment(property, allocation);
		delete pendingIncrements[_metrics];
	}
}

contract AllocationBlockNumber {
	uint256 private _baseBlockNumber;
	mapping(address => uint256) private _lastAllocationBlockNumber;
	constructor() public {
		_baseBlockNumber = block.number;
	}
	function getLastAllocationBlockNumber(address _metrics)
		public
		view
		returns (uint256)
	{
		uint256 lastAllocationBlockNumber = _lastAllocationBlockNumber[_metrics] >
			0
			? _lastAllocationBlockNumber[_metrics]
			: _baseBlockNumber;
		return lastAllocationBlockNumber;
	}
	function setLastAllocationBlockNumber(address _metrics) public {
		_lastAllocationBlockNumber[_metrics] = block.number;
	}
}
