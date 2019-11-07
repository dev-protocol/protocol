pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./libs/Timebased.sol";

contract LastAllocationTime {
	using SafeMath for uint256;
	Timebased private timebased;
	mapping(address => uint256) private lastAllocationTimeEachMetrics;
	constructor() public {
		timebased = new Timebased();
	}
	function getLastDistribute(address metrics) private view returns (uint256) {
		uint256 lastDistribute = lastAllocationTimeEachMetrics[metrics] > 0
			? lastAllocationTimeEachMetrics[metrics]
			: timebased.getStartTime();
		return lastDistribute;
	}

	function getLastAllocationTime(address metrics) public view returns (uint256) {
		return lastAllocationTimeEachMetrics[metrics];
	}

	function setLastAllocationTime(address metrics, uint256 timestamp) public {
		lastAllocationTimeEachMetrics[metrics] = timestamp;
	}

	function setSecondsPerBlock(uint256 sec) public {
		timebased.setSecondsPerBlock(sec);
	}

	function getTimeInfo() public view returns (uint256, uint256) {
		uint256 timestamp = timebased.getTimestamp();
		uint256 yesterday = timestamp - 1 days;
		return (timestamp, yesterday);
	}

	function ensureDiffDays(address metrics, uint256 yesterday) public view {
		uint256 lastDistribute = getLastDistribute(metrics);
		uint256 diff = diffDays(
			lastDistribute,
			yesterday
		);
		require(diff >= 1, "Expected an interval is one day or more");
	}

	function diffDays(uint fromTimestamp, uint toTimestamp) private pure returns (uint _days)
	{
		require(fromTimestamp <= toTimestamp, "From timestamp is lower then to timestamp");
		_days = (toTimestamp - fromTimestamp) / (24 * 60 * 60);
	}
}
