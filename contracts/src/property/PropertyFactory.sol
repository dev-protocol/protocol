pragma solidity ^0.5.0;

import "./Property.sol";
import "./PropertyGroup.sol";
import "../vote/VoteTimes.sol";
import "../common/validate/StringValidator.sol";

contract PropertyFactory is UsingConfig {
	event Create(address indexed _from, address _property);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function createProperty(string memory _name, string memory _symbol)
		public
		returns (address)
	{
		StringValidator validator = new StringValidator();
		validator.validateEmpty(_name);
		validator.validateEmpty(_symbol);

		Property property = new Property(
			address(config()),
			msg.sender,
			_name,
			_symbol
		);
		PropertyGroup(config().propertyGroup()).addGroup(address(property));
		emit Create(msg.sender, address(property));
		VoteTimes(config().voteTimes()).resetVoteTimesByProperty(
			address(property)
		);
		return address(property);
	}
}
