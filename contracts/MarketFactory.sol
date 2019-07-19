pragma solidity ^0.5.0;

import "./UseState.sol";
import "./Market.sol";

contract MarketFactory is UseState {
	function createMarket(address _addr) public returns (address) {
		Market market = new Market(_addr);
		address marketAddr = address(market);
		addMarket(marketAddr);
		return marketAddr;
	}
}
