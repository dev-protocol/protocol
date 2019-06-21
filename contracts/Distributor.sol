pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "./modules/BokkyPooBahsDateTimeLibrary.sol";
import "./libs/UintToString.sol";
import "./libs/Killable.sol";
import "./libs/Timebased.sol";
import "./Calculator.sol";
import "./Repository.sol";
import "./UseState.sol";

contract Distributor is Timebased, Calculator, Killable, Ownable, UseState {
	using SafeMath for uint;
	using UintToString for uint;
	uint public mintVolumePerDay;
	uint public lastDistribute;
	mapping(string => address) distributors;

	function setMintVolumePerDay(uint _vol) public onlyOwner {
		mintVolumePerDay = _vol;
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

	function distribute() public payable {
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
		calculate(start, end, value, msg.sender);
		lastDistribute = timestamp();
		msg.sender.transfer(this.balance);
	}
}
