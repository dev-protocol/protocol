pragma solidity ^0.5.0;

contract IMarket {
	function calculate(address _metrics, uint256 _start, uint256 _end)
		external
		returns (bool);

	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5
		// solium-disable-next-line indentation
	) public returns (address);

	function getAuthenticationFee(address _property)
		private
		view
		returns (uint256);

	function authenticatedCallback(address _property)
		external
		returns (address);

	function vote(address _property, bool _agree) external;

	function schema() external view returns (string memory);
}
