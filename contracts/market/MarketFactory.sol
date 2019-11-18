pragma solidity ^0.5.0;

import "./Market.sol";
import "./MarketGroup.sol";

contract MarketFactory {
	MarketGroup private _marketGroup;

	constructor() public {
		_marketGroup = new MarketGroup(address(this));
	}

	event Create(address indexed _from, address _market);

	function createMarket(address _addr) public returns (address) {
		Market market = new Market(_addr, false);
		address marketAddr = address(market);
		_marketGroup.addMarket(marketAddr);
		emit Create(msg.sender, marketAddr);
	}
}
