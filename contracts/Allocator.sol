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
import "./UseState.sol";

contract Allocator is Timebased, Killable, Ownable, UseState, Withdrawable {
	using SafeMath for uint;

	mapping(address => uint) lastAllocationTimeEachProperty;
	mapping(address => uint) lastAllocationBlockEachProperty;
	mapping(address => uint) lastAllocationValueEachProperty;
	mapping(address => uint) lastTotalAllocationValuePerBlockEachMarket;

	mapping(address => uint) initialContributionBlockEachMarket;
	mapping(address => uint) lastContributionBlockEachMarket;
	mapping(address => uint) totalContributionValueEachMarket;
	mapping(address => uint) totalAllocationValueEachMarket;
	mapping(address => bool) pendingIncrements;
	mapping(address => uint) mintPerBlock;

	function setSecondsPerBlock(uint _sec) public onlyOwner {
		_setSecondsPerBlock(_sec);
	}

	function updateAllocateValue(uint _value) public {
		address prop = msg.sender;
		require(isProperty(prop), "Is't Property Contract");
		address market = Property(prop).market();
		totalContributionValueEachMarket[market] += _value;
		uint totalContributionsPerBlock = totalContributionValueEachMarket[market] / (
			block.number - initialContributionBlockEachMarket[market]
		);
		uint lastContributionPerBlock = _value / (
			block.number - lastContributionBlockEachMarket[market]
		);
		uint acceleration = lastContributionPerBlock / totalContributionsPerBlock;
		totalAllocationValueEachMarket[market] += _value * acceleration;
		mintPerBlock[market] = totalContributionsPerBlock * acceleration;

		if (_value > 0) {
			lastContributionBlockEachMarket[market] = block.number;
		}
	}

	function allocate(address _prop) public payable {
		require(isProperty(_prop), "Is't Property Contract");
		uint lastDistribute = lastAllocationTimeEachProperty[_prop] > 0
			? lastAllocationTimeEachProperty[_prop]
			: baseTime.time;
		uint yesterday = timestamp() - 1 days;
		uint diff = BokkyPooBahsDateTimeLibrary.diffDays(
			lastDistribute,
			yesterday
		);
		require(diff >= 1, "Expected an interval is one day or more");
		address market = Property(_prop).market();
		pendingIncrements[_prop] = true;
		Market(market).calculate(
			_prop,
			lastAllocationTimeEachProperty[_prop],
			yesterday
		);
		lastAllocationTimeEachProperty[_prop] = timestamp();
	}

	function calculatedCallback(address _prop, uint _value) public {
		require(
			msg.sender == Market(Property(_prop).market()).behavior(),
			"Don't call from other than Market Behavior"
		);
		require(
			pendingIncrements[_prop] == true,
			"Not asking for an indicator"
		);
		address market = Property(_prop).market();
		uint period = block.number - lastAllocationBlockEachProperty[_prop];
		uint allocationPerBlock = _value / period;
		uint nextTotalAllocationValuePerBlock = lastTotalAllocationValuePerBlockEachMarket[market] - lastAllocationValueEachProperty[_prop] + allocationPerBlock;
		uint allocation = allocationPerBlock / nextTotalAllocationValuePerBlock * mintPerBlock[market] * period;
		lastAllocationBlockEachProperty[_prop] = block.number;
		lastAllocationValueEachProperty[_prop] = allocationPerBlock;
		lastTotalAllocationValuePerBlockEachMarket[market] = nextTotalAllocationValuePerBlock;
		increment(_prop, allocation);
		delete pendingIncrements[_prop];
	}
}
