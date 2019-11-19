pragma solidity ^0.5.0;

import "../UseState.sol";

contract MarketGroup is UseState {
	mapping(address => bool) private _markets;

	modifier onlyMarketFactory() {
		require(msg.sender == marketFactory(), "only market factory contract.");
		_;
	}

	function validateMarketAddress(address marketAddress) public view {
		require(_markets[marketAddress], "only market contract.");
	}

	function addMarket(address _addr) public onlyMarketFactory returns (bool) {
		_markets[_addr] = true;
		return true;
	}
}
