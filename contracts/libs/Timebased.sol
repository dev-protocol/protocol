pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Timebased is Ownable {
	struct BaseTime {
		uint time;
		uint blockHeight;
	}
	BaseTime internal baseTime;
	uint internal secondsPerBlock = 15;

	constructor() public {
		// solium-disable-next-line security/no-block-members
		baseTime = BaseTime(now, block.number);
	}

	function setSecondsPerBlock(uint _sec) public onlyOwner {
		secondsPerBlock = _sec;
	}

	function timestamp() internal view returns (uint) {
		uint diff = block.number - baseTime.blockHeight;
		uint sec = diff.div(secondsPerBlock);
		uint _now = baseTime.time.add(sec);
		return _now;
	}
}
