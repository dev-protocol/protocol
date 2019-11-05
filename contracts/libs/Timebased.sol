pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Timebased {
	using SafeMath for uint256;
	struct BaseTime {
		uint256 time;
		uint256 blockHeight;
	}
	BaseTime internal baseTime;
	uint256 internal secondsPerBlock = 15;

	constructor() public {
		// solium-disable-next-line security/no-block-members
		baseTime = BaseTime(now, block.number);
	}

	function _setSecondsPerBlock(uint256 _sec) internal {
		secondsPerBlock = _sec;
	}

	function timestamp() internal view returns (uint256) {
		uint256 diff = block.number - baseTime.blockHeight;
		uint256 sec = diff.mod(secondsPerBlock);
		uint256 _now = baseTime.time.add(sec);
		return _now;
	}
}
