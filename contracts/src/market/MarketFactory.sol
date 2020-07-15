pragma solidity ^0.5.0;

import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {IMarketFactory} from "contracts/src/market/IMarketFactory.sol";
import {Market} from "contracts/src/market/Market.sol";
import {IMarketGroup} from "contracts/src/market/IMarketGroup.sol";

contract MarketFactory is IMarketFactory, UsingConfig, UsingValidator {
	event Create(address indexed _from, address _market);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function create(address _addr) external returns (address) {
		addressValidator().validateIllegalAddress(_addr);

		Market market = new Market(address(config()), _addr);
		address marketAddr = address(market);
		IMarketGroup marketGroup = IMarketGroup(config().marketGroup());
		marketGroup.addGroup(marketAddr);
		if (marketGroup.getCount() == 1) {
			market.toEnable();
		}
		emit Create(msg.sender, marketAddr);
		return marketAddr;
	}
}
