pragma solidity ^0.5.0;

import "./Market.sol";

contract MarketFactory {
	function createMarket(address _addr) public returns (address) {
		Market market = new Market(_addr);
		return address(market);
	}
}
