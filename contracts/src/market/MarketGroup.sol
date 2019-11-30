pragma solidity ^0.5.0;

import "../common/config/UsingConfig.sol";
import "../common/modifier/UsingModifier.sol";

contract MarketGroup is UsingConfig, UsingModifier {
	mapping(address => bool) private _markets;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config)
		public
		UsingConfig(_config)
		UsingModifier(_config)
	{}

	function validateMarketAddress(address marketAddress) public view {
		require(_markets[marketAddress], "only market contract");
	}

	function addMarket(address _addr) public onlyMarketFactory returns (bool) {
		_markets[_addr] = true;
		return true;
	}
}
