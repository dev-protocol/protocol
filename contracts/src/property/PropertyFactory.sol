pragma solidity ^0.5.0;

import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {Property} from "contracts/src/property/Property.sol";
import {IGroup} from "contracts/src/property/PropertyGroup.sol";
import {IPropertyFactory} from "contracts/src/property/IPropertyFactory.sol";

/**
 * A factory contract that creates a new Property contract.
 */
contract PropertyFactory is UsingConfig, IPropertyFactory {
	event Create(address indexed _from, address _property);

	/**
	 * Initialize the passed address as AddressConfig address.
	 */
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	/**
	 * Creates a new Property contract.
	 */
	function create(
		string calldata _name,
		string calldata _symbol,
		address _author
	) external returns (address) {
		/**
		 * Validates the name and the token symbol.
		 */
		validatePropertyName(_name);
		validatePropertySymbol(_symbol);

		/**
		 * Creates a new Property contract.
		 */
		Property property = new Property(
			address(config()),
			_author,
			_name,
			_symbol
		);

		/**
		 * Adds the new Property contract to the Property address set.
		 */
		IGroup(config().propertyGroup()).addGroup(address(property));

		emit Create(msg.sender, address(property));
		return address(property);
	}

	/**
	 * Validates the token name.
	 */
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

	/**
	 * Validates the token symbol.
	 */
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
