pragma solidity ^0.5.0;

import "./Market.sol";
import "./MarketGroup.sol";
import "../vote.sol";

contract MarketFactory is UsingConfig {
	event Create(address indexed _from, address _market);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function createMarket(address _addr) public returns (address) {
		Market market = new Market(address(config()), _addr);
		address marketAddr = address(market);
		MarketGroup(config().marketGroup()).addMarket(marketAddr);
		emit Create(msg.sender, marketAddr);
		VoteCounter(config().voteCounter()).addVoteCount();
		return marketAddr;
	}
}
