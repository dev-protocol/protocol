pragma solidity ^0.5.0;

contract PropertyGroup {
	address private _propertyFactory;
	mapping(address => bool) private _properties;

	constructor(address propertyFactory) public {
		_propertyFactory = propertyFactory;
	}

	modifier onlyPropertyFactory() {
		require(
			msg.sender == _propertyFactory,
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
