pragma solidity ^0.5.0;

import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {Killable} from "contracts/src/common/lifecycle/Killable.sol";
import {VoteTimes} from "contracts/src/vote/times/VoteTimes.sol";
import {Market} from "contracts/src/market/Market.sol";
import {MarketGroup} from "contracts/src/market/MarketGroup.sol";


contract MarketFactory is Pausable, UsingConfig, UsingValidator, Killable {
	event Create(address indexed _from, address _market);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function create(address _addr) external returns (address) {
		require(paused() == false, "You cannot use that");
		addressValidator().validateIllegalAddress(_addr);

		Market market = new Market(address(config()), _addr);
		address marketAddr = address(market);
		MarketGroup marketGroup = MarketGroup(config().marketGroup());
		marketGroup.addGroup(marketAddr);
		if (marketGroup.getCount() == 1) {
			market.toEnable();
		}
		emit Create(msg.sender, marketAddr);
		VoteTimes(config().voteTimes()).addVoteTime();
		return marketAddr;
	}
}
