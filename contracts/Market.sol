pragma solidity ^0.5.0;

import "./UseState.sol";
import "./Property.sol";

contract Behavior {
	string public schema;

	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5
	) public returns (bool) {
		// Implementation for authentication.
	}

	function calculate(address _prop, uint _start, uint _end)
		public
		returns (bool)
	{
		// Implementation for fetches index value.
	}
}

contract Market is UseState {
	bool public enabled = false;
	address public behavior;
	uint8 decimals = 18;
	uint supply = 10000000;

	constructor(address _behavior) public {
		behavior = _behavior;
	}

	function schema() public returns (string memory) {
		return Behavior(behavior).schema();
	}

	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5
	) public returns (bool) {
		return Behavior(behavior).authenticate(
			_prop,
			_args1,
			_args2,
			_args3,
			_args4,
			_args5
		);
	}

	function calculate(address _prop, uint _start, uint _end)
		public
		returns (bool)
	{
		return Behavior(behavior).calculate(_prop, _start, _end);
	}

	function vote(bool _answer) public {
		// not implemented yet.
	}

	function authenticatedCallback(address _prop, address _owner)
		public
		returns (bool)
	{
		return Property(_prop).authorizeOwner(_owner);
	}

	function createProperty(string memory _id, string memory _symbol)
		public
		returns (address)
	{
		address exists = getRepository(_id);
		require(exists == address(0), "Property is already created");
		Property property = new Property(
			address(this),
			_id,
			_symbol,
			_symbol,
			decimals,
			supply
		);
		address propertyAddress = address(property);
		addRepository(_id, propertyAddress);
		return propertyAddress;
	}
}
