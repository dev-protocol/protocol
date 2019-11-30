pragma solidity ^0.5.0;

import "../common/config/UsingConfig.sol";
import "../common/modifier/UsingModifier.sol";

contract PropertyGroup is UsingConfig, UsingModifier {
	mapping(address => bool) private _properties;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config)
		public
		UsingConfig(_config)
		UsingModifier(_config)
	{}

	function addProperty(address _prop) public onlyPropertyFactory {
		require(_prop != address(0), "property is an invalid address");
		_properties[_prop] = true;
	}

	function isProperty(address _addr) public view returns (bool) {
		return _properties[_addr];
	}
}
