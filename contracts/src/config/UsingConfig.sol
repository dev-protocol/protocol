pragma solidity ^0.5.0;

import "./AddressConfig.sol";

contract UsingConfig {
	AddressConfig private _config;

	constructor(address _addressConfig) public {
		_config = AddressConfig(_addressConfig);
	}
	function config() internal view returns (AddressConfig) {
		return _config;
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
}
