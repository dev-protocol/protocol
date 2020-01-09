pragma solidity ^0.5.0;

import {Pausable} from "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {StringValidator} from "contracts/src/common/validate/StringValidator.sol";
import {VoteTimes} from "contracts/src/vote/times/VoteTimes.sol";
import {Property} from "contracts/src/property/Property.sol";
import {PropertyGroup} from "contracts/src/property/PropertyGroup.sol";

contract PropertyFactory is Pausable, UsingConfig {
	event Create(address indexed _from, address _property);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function create(
		string calldata _name,
		string calldata _symbol,
		address _author
	) external returns (address) {
		require(paused() == false, "You cannot use that");
		StringValidator validator = new StringValidator();
		validator.validatePropertyName(_name);
		validator.validatePropertySymbol(_symbol);

		Property property = new Property(
			address(config()),
			_author,
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
