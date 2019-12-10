pragma solidity ^0.5.0;

import "../config/AddressConfig.sol";
import "../../property/PropertyGroup.sol";

contract GroupValidator {
	AddressConfig private _config;
	constructor(AddressConfig _addressConfig) public {
		_config = _addressConfig;
	}
	function validateProperty(address _property) external view {
		require(
			PropertyGroup(_config.propertyGroup()).isGroup(_property),
			"this address is not property contract"
		);
	}
}
