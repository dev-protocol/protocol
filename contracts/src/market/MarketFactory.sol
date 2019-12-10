pragma solidity ^0.5.0;

import "../common/validate/AddressValidator.sol";
import "./Market.sol";
import "./MarketGroup.sol";
import "../vote/VoteTimes.sol";

contract MarketFactory is UsingConfig {
	event Create(address indexed _from, address _market);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function createMarket(address _addr) public returns (address) {
		AddressValidator validator = new AddressValidator();
		validator.validateDefault(_addr);

		Market market = new Market(address(config()), _addr);
		address marketAddr = address(market);
		MarketGroup(config().marketGroup()).addGroup(marketAddr);
		emit Create(msg.sender, marketAddr);
		VoteTimes(config().voteTimes()).addVoteCount();
		return marketAddr;
	}
}
