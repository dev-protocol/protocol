pragma solidity ^0.5.0;

import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {Property} from "contracts/src/property/Property.sol";
import {IGroup} from "contracts/src/property/PropertyGroup.sol";
import {IPropertyFactory} from "contracts/src/property/IPropertyFactory.sol";

contract PropertyFactory is UsingConfig, IPropertyFactory {
	event Create(address indexed _from, address _property);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function create(
		string calldata _name,
		string calldata _symbol,
		address _author
	) external returns (address) {
		validatePropertyName(_name);
		validatePropertySymbol(_symbol);

		Property property = new Property(
			address(config()),
			_author,
			_name,
			_symbol
		);
		IGroup(config().propertyGroup()).addGroup(address(property));
		emit Create(msg.sender, address(property));
		return address(property);
	}

	function validatePropertyName(string memory _name) private pure {
		uint256 len = bytes(_name).length;
		require(
			len >= 3,
			"name must be at least 3 and no more than 10 characters"
		);
		require(
			len <= 10,
			"name must be at least 3 and no more than 10 characters"
		);
	}

	function validatePropertySymbol(string memory _symbol) private pure {
		uint256 len = bytes(_symbol).length;
		require(
			len >= 3,
			"symbol must be at least 3 and no more than 10 characters"
		);
		require(
			len <= 10,
			"symbol must be at least 3 and no more than 10 characters"
		);
	}
}
