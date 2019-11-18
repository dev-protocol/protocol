pragma solidity ^0.5.0;

contract MarketGroup {
	address private _marketFactory;
	mapping(address => bool) private _markets;

	constructor(address marketFactory) public {
		_marketFactory = marketFactory;
	}

	modifier onlyMarket() {
		require(_markets[msg.sender], "only market contract.");
		_;
	}

	modifier onlyMarketFactory() {
		require(msg.sender == _marketFactory, "only market factory contract.");
		_;
	}

	function addMarket(address _addr) public onlyMarketFactory returns (bool) {
		_markets[_addr] = true;
		return true;
	}
}
