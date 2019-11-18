pragma solidity ^0.5.0;

import "../UseState.sol";
import "./Market.sol";
import "./MarketGroup.sol";

contract MarketFactory is UseState{

	event Create(address indexed _from, address _market);

	function createMarket(address _addr) public returns (address) {
		Market market = new Market(_addr, false);
		address marketAddr = address(market);
		MarketGroup(marketGroup()).addMarket(marketAddr);
		emit Create(msg.sender, marketAddr);
	}
}
