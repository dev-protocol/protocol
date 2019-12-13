pragma solidity ^0.5.0;

contract IMarket {
	string public schema;

	function authenticate(
		address _prop,
		string calldata _args1,
		string calldata _args2,
		string calldata _args3,
		string calldata _args4,
		string calldata _args5
		// solium-disable-next-line indentation
	) external returns (bool);

	function calculate(address _metrics, uint256 _start, uint256 _end)
		external
		returns (bool);
}
