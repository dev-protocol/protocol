pragma solidity 0.5.17;

import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import "../common/config/UsingConfig.sol";
import "../market/Market.sol";
import "../../interface/IMarket.sol";
import "../../interface/IMarketFactory.sol";
import "../../interface/IMarketGroup.sol";

/**
 * A factory contract that creates a new Market contract.
 */
contract MarketFactory is Ownable, IMarketFactory, UsingConfig {
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
		require(_addr != address(0), "this is illegal address");

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

	/**
	 * Creates a new Market contract.
	 */
	function enable(address _addr) external onlyOwner {
		/**
		 * Validates the passed address is not 0 address.
		 */
		IMarketGroup marketGroup = IMarketGroup(config().marketGroup());
		require(marketGroup.isGroup(_addr), "this is illegal address");

		/**
		 * Market will be enable.
		 */
		IMarket market = IMarket(_addr);
		require(market.enabled() == false, "already enabled");

		market.toEnable();
	}
}
