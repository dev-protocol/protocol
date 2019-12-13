pragma solidity ^0.5.0;

import "contracts/src/common/validate/AddressValidator.sol";
import {VoteTimes} from "contracts/src/vote/times/VoteTimes.sol";
import "contracts/src/market/Market.sol";
import "contracts/src/market/MarketGroup.sol";

contract MarketFactory is UsingConfig {
	event Create(address indexed _from, address _market);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function createMarket(address _addr) public returns (address) {
		new AddressValidator().validateDefault(_addr);

		Market market = new Market(address(config()), _addr);
		address marketAddr = address(market);
		MarketGroup(config().marketGroup()).addGroup(marketAddr);
		emit Create(msg.sender, marketAddr);
		VoteTimes(config().voteTimes()).addVoteCount();
		return marketAddr;
	}
}
