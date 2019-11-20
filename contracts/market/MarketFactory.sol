pragma solidity ^0.5.0;

import "./Market.sol";
import "./MarketGroup.sol";

contract MarketFactory is UsingConfig {
	event Create(address indexed _from, address _market);

	constructor(address _config) public UsingConfig(_config) {}

	function createMarket(address _addr) public returns (address) {
		Market market = new Market(address(config()), _addr, false);
		address marketAddr = address(market);
		MarketGroup(config().marketGroup()).addMarket(marketAddr);
		emit Create(msg.sender, marketAddr);
	}
}
