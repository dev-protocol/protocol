pragma solidity ^0.5.0;

contract IMarket {
	string public schema;

	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5
	// solium-disable-next-line indentation
	) public returns (bool);

	function calculate(address _prop, uint256 _start, uint256 _end)
		public
		returns (bool);
}
