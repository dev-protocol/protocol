pragma solidity ^0.5.0;

import "../config/AddressConfig.sol";
import "../../property/PropertyGroup.sol";

contract UsingModifier {
	AddressConfig private _config;

	constructor(address _addressConfig) public {
		_config = AddressConfig(_addressConfig);
	}

	modifier onlyMarketFactory() {
		require(
			msg.sender == _config.marketFactory(),
			"only market factory contract"
		);
		_;
	}
	modifier onlyPropertyFactory() {
		require(
			msg.sender == _config.propertyFactory(),
			"only property factory contract"
		);
		_;
	}
	modifier onlyLockup() {
		require(msg.sender == _config.lockup(), "only lockup contract");
		_;
	}

	modifier onlyProperty(address _property) {
		require(
			PropertyGroup(_config.propertyGroup()).isProperty(_property),
			"only property contract"
		);
		_;
	}
}
