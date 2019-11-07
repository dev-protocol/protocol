pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Timebased {
	using SafeMath for uint256;
	struct BaseTime {
		uint256 time;
		uint256 blockHeight;
	}
	BaseTime private baseTime;
	uint256 private secondsPerBlock = 15;

	constructor() public {
		// solium-disable-next-line security/no-block-members
		baseTime = BaseTime(now, block.number);
	}

	function setSecondsPerBlock(uint256 _sec) public {
		secondsPerBlock = _sec;
	}

	function getTimestamp() public view returns (uint256) {
		uint256 diff = block.number - baseTime.blockHeight;
		uint256 sec = diff.mod(secondsPerBlock);
		uint256 _now = baseTime.time.add(sec);
		return _now;
	}

	function getStartTime() public view returns (uint256) {
		return baseTime.time;
	}
}
