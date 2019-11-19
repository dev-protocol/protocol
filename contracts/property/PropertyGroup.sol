pragma solidity ^0.5.0;

import "../UseState.sol";

contract PropertyGroup is UseState {
	mapping(address => bool) private _properties;

	modifier onlyPropertyFactory() {
		require(
			msg.sender == propertyFactory(),
			"only property factory contract."
		);
		_;
	}

	function addProperty(address _prop) public onlyPropertyFactory {
		require(_prop != address(0), "property is an invalid address.");
		_properties[_prop] = true;
	}

	function isProperty(address _addr) public view returns (bool) {
		return _properties[_addr];
	}
}
