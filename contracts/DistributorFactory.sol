pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "./modules/BokkyPooBahsDateTimeLibrary.sol";
import "./libs/UintToString.sol";
import "./libs/Killable.sol";
import "./Distributor.sol";
import "./UseState.sol";

contract DistributorFactory is Killable, Ownable, UseState {
	using SafeMath for uint;
	using UintToString for uint;
	uint public mintVolumePerDay;
	uint public lastDistribute;
	struct BaseTime {
		uint time;
		uint blockHeight;
	}
	BaseTime public baseTime;
	uint public secondsPerBlock = 15;
	mapping(string => address) distributors;

	constructor() public {
		// solium-disable-next-line security/no-block-members
		baseTime = BaseTime(now, block.number);
	}

	function timestamp() internal view returns (uint) {
		uint diff = block.number - baseTime.blockHeight;
		uint sec = diff.div(secondsPerBlock);
		uint _now = baseTime.time.add(sec);
		return _now;
	}

	function setMintVolumePerDay(uint _vol) public onlyOwner {
		mintVolumePerDay = _vol;
	}

	function setSecondsPerBlock(uint _sec) public onlyOwner {
		secondsPerBlock = _sec;
	}

	function dateFormat(uint _y, uint _m, uint _d)
		internal
		pure
		returns (string memory)
	{
		return string(
			abi.encodePacked(
				_y.toString(),
				"-",
				_m.toString(),
				"-",
				_d.toString()
			)
		);
	}

	function createDistributor() public payable {
		uint yesterday = timestamp() - 1 days;
		uint diff = BokkyPooBahsDateTimeLibrary.diffDays(
			lastDistribute,
			yesterday
		);
		require(diff >= 1, "Expected an interval is one day or more");
		(uint startY, uint startM, uint startD) = BokkyPooBahsDateTimeLibrary.timestampToDate(
			lastDistribute
		);
		(uint endY, uint endM, uint endD) = BokkyPooBahsDateTimeLibrary.timestampToDate(
			yesterday
		);
		string memory start = dateFormat(startY, startM, startD);
		string memory end = dateFormat(endY, endM, endD);
		uint value = diff.mul(mintVolumePerDay);
		Distributor dist = (new Distributor).value(msg.value)(
			start,
			end,
			value,
			msg.sender
		);
		dist.distribute();
		distributors[start] = address(dist);
		ERC20Mintable(getToken()).addMinter(address(dist));
		lastDistribute = timestamp();
	}
}
