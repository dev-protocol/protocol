pragma solidity 0.5.17;

import {IMetrics} from "contracts/interface/IMetrics.sol";

/**
 * A contract for associating a Property and an asset authenticated by a Market.
 */
contract Metrics is IMetrics {
	address public market;
	address public property;

	constructor(address _market, address _property) public {
		//Do not validate because there is no AddressConfig
		market = _market;
		property = _property;
	}
}
