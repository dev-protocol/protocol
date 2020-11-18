pragma solidity 0.5.17;

import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {IMarketFactory} from "contracts/src/market/IMarketFactory.sol";
import {Market} from "contracts/src/market/Market.sol";
import {IMarketGroup} from "contracts/src/market/IMarketGroup.sol";

/**
 * A factory contract that creates a new Market contract.
 */
contract MarketFactory is IMarketFactory, UsingConfig, UsingValidator {
	event Create(address indexed _from, address _market);

	/**
	 * Initialize the passed address as AddressConfig address.
	 */
	constructor(address _config) public UsingConfig(_config) {}

	/**
	 * Creates a new Market contract.
	 */
	function create(address _addr) external returns (address) {
		/**
		 * Validates the passed address is not 0 address.
		 */
		addressValidator().validateIllegalAddress(_addr);

		/**
		 * Creates a new Market contract with the passed address as the IMarketBehavior.
		 */
		Market market = new Market(address(config()), _addr);

		/**
		 * Adds the created Market contract to the Market address set.
		 */
		address marketAddr = address(market);
		IMarketGroup marketGroup = IMarketGroup(config().marketGroup());
		marketGroup.addGroup(marketAddr);

		/**
		 * For the first Market contract, it will be activated immediately.
		 * If not, the Market contract will be activated after a vote by the voters.
		 */
		if (marketGroup.getCount() == 1) {
			market.toEnable();
		}

		emit Create(msg.sender, marketAddr);
		return marketAddr;
	}
}
