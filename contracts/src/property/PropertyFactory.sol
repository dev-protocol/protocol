pragma solidity ^0.5.0;

import "contracts/src/common/validate/StringValidator.sol";
import {VoteTimes} from "contracts/src/vote/times/VoteTimes.sol";
import "contracts/src/property/Property.sol";
import "contracts/src/property/PropertyGroup.sol";

contract PropertyFactory is UsingConfig {
	event Create(address indexed _from, address _property);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function createProperty(string calldata _name, string calldata _symbol)
		external
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
