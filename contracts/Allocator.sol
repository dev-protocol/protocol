pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "./modules/BokkyPooBahsDateTimeLibrary.sol";
import "./libs/Killable.sol";
import "./libs/Timebased.sol";
import "./libs/Withdrawable.sol";
import "./Property.sol";
import "./Market.sol";
import "./Metrics.sol";
import "./UseState.sol";

contract Allocator is Timebased, Killable, Ownable, UseState, Withdrawable {
	using SafeMath for uint256;

	mapping(address => uint256) lastAllocationTimeEachMetrics;
	mapping(address => uint256) lastAllocationBlockEachMetrics;
	mapping(address => uint256) lastAllocationValueEachMetrics;
	uint256 public lastTotalAllocationValuePerBlock;

	uint256 public initialContributionBlock;
	uint256 public lastContributionBlock;
	uint256 public totalContributionValue;
	mapping(address => bool) pendingIncrements;
	uint256 public mintPerBlock;

	function setSecondsPerBlock(uint256 _sec) public onlyOwner {
		_setSecondsPerBlock(_sec);
	}

	function updateAllocateValue(uint256 _value) public {
		address prop = msg.sender;
		require(isProperty(prop), "Is't Property Contract");
		totalContributionValue += _value;
		uint256 totalContributionsPerBlock = totalContributionValue /
			(block.number - initialContributionBlock);
		uint256 lastContributionPerBlock = _value /
			(block.number - lastContributionBlock);
		uint256 acceleration = lastContributionPerBlock /
			totalContributionsPerBlock;
		mintPerBlock = totalContributionsPerBlock * acceleration;

		if (_value > 0) {
			lastContributionBlock = block.number;
		}
	}

	function allocate(address _metrics) public payable {
		require(isMetrics(_metrics), "Is't Metrics Contract");
		uint256 lastDistribute = lastAllocationTimeEachMetrics[_metrics] > 0
			? lastAllocationTimeEachMetrics[_metrics]
			: baseTime.time;
		uint256 yesterday = timestamp() - 1 days;
		uint256 diff = BokkyPooBahsDateTimeLibrary.diffDays(
			lastDistribute,
			yesterday
		);
		require(diff >= 1, "Expected an interval is one day or more");
		address market = Metrics(_metrics).market();
		pendingIncrements[_metrics] = true;
		Market(market).calculate(
			_metrics,
			lastAllocationTimeEachMetrics[_metrics],
			yesterday
		);
		lastAllocationTimeEachMetrics[_metrics] = timestamp();
	}

	function calculatedCallback(address _metrics, uint256 _value) public {
		require(
			msg.sender == Market(Metrics(_metrics).market()).behavior(),
			"Don't call from other than Market Behavior"
		);
		require(
			pendingIncrements[_metrics] == true,
			"Not asking for an indicator"
		);
		address market = Metrics(_metrics).market();
		address property = Metrics(_metrics).property();
		uint256 share = Market(market).issuedMetrics() /
			state().totalIssuedMetrics();
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
