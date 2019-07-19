pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "./modules/BokkyPooBahsDateTimeLibrary.sol";
import "./libs/UintToString.sol";
import "./libs/StringToUint.sol";
import "./libs/Killable.sol";
import "./libs/Timebased.sol";
import "./libs/Withdrawable.sol";
import "./modules/oraclizeAPI_0.5.sol";
import "./Property.sol";
import "./Market.sol";
import "./UseState.sol";

contract Allocator is
	Timebased,
	Killable,
	Ownable,
	UseState,
	usingOraclize,
	Withdrawable
{
	using SafeMath for uint;
	using UintToString for uint;
	using StringToUint for string;

	mapping(address => uint) lastDistributionTime;
	mapping(address => uint) lastDistributionBlock;
	mapping(address => bool) pendingIncrements;
	mapping(address => uint) lastDistributionValuePerBlock;
	mapping(address => uint) lastTotalDistributionValuePerBlock;

	mapping(address => uint) initialContributionBlock;
	mapping(address => uint) prevContributionBlock;
	mapping(address => uint) totalContributions;
	mapping(address => uint) totalAllocation;
	mapping(address => uint) mintPerBlock;

	function setSecondsPerBlock(uint _sec) public onlyOwner {
		_setSecondsPerBlock(_sec);
	}

	function updateAllocateValue(uint _value) public {
		address prop = msg.sender;
		require(isProperty(prop), "Is't Property Contract");
		address market = Property(prop).market();
		totalContributions[market] += _value;
		uint totalContributionsPerBlock = totalContributions[market] / (
			block.number - initialContributionBlock[market]
		);
		uint lastContributionPerBlock = _value / (
			block.number - prevContributionBlock[market]
		);
		uint acceleration = lastContributionPerBlock / totalContributionsPerBlock;
		totalAllocation[market] += _value * acceleration;
		mintPerBlock[market] = totalContributionsPerBlock * acceleration;

		if (_value > 0) {
			prevContributionBlock[market] = block.number;
		}
	}

	function allocate(address _prop) public payable {
		require(isProperty(_prop), "Is't Property Contract");
		uint lastDistribute = lastDistributionTime[_prop] > 0
			? lastDistributionTime[_prop]
			: baseTime.time;
		uint yesterday = timestamp() - 1 days;
		uint diff = BokkyPooBahsDateTimeLibrary.diffDays(
			lastDistribute,
			yesterday
		);
		require(diff >= 1, "Expected an interval is one day or more");
		address market = Property(_prop).market();
		pendingIncrements[_prop] = true;
		Market(market).calculate(_prop, lastDistributionTime[_prop], yesterday);
		lastDistributionTime[_prop] = timestamp();
	}

	function calculatedCallback(address _prop, uint _value) public {
		require(
			pendingIncrements[_prop] == true,
			"Not asking for an indicator"
		);
		address market = Property(_prop).market();
		uint period = block.number - lastDistributionBlock[_prop];
		uint distributionsPerBlock = _value / period;
		uint nextTotalValuePerBlock = lastTotalDistributionValuePerBlock[market] - lastDistributionValuePerBlock[_prop] + distributionsPerBlock;
		uint distributions = distributionsPerBlock / nextTotalValuePerBlock * mintPerBlock[market] * period;
		lastDistributionBlock[_prop] = block.number;
		lastDistributionValuePerBlock[_prop] = distributionsPerBlock;
		lastTotalDistributionValuePerBlock[market] = nextTotalValuePerBlock;
		increment(_prop, distributions);
		delete pendingIncrements[_prop];
	}
}
