pragma solidity ^0.5.0;

import "./Property.sol";
import "./policy/PolicyFactory.sol";

contract PropertyFactory is UseState {
	uint8 decimals = 18;
	uint256 supply = 10000000;

	event Create(address indexed _from, address _property);

	function createProperty(string memory _name, string memory _symbol)
		public
		returns (address)
	{
		Property property = new Property(
			msg.sender,
			_name,
			_symbol,
			decimals,
			supply
		);
		addProperty(address(property));
		emit Create(msg.sender, address(property));
		PolicyVoteCounter(Policy(policy()).voteCounterAddress())
			.resetVoteCountByProperty(address(property));
		return address(property);
	}
}
