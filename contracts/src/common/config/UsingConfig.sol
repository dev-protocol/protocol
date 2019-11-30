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
}
