pragma solidity ^0.5.0;

import "../config/UsingConfig.sol";

contract MarketGroup is UsingConfig {
	mapping(address => bool) private _markets;

	constructor(address configAddress) public UsingConfig(configAddress) {}

	modifier onlyMarketFactory() {
		require(
			msg.sender == config().marketFactory(),
			"only market factory contract."
		);
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
