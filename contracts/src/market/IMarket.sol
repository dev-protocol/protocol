pragma solidity 0.5.17;

interface IMarket {
	function authenticate(
		address _prop,
		string calldata _args1,
		string calldata _args2,
		string calldata _args3,
		string calldata _args4,
		string calldata _args5
	) external returns (bool);

	function authenticateFromPropertyFactory(
		address _prop,
		address _author,
		string calldata _args1,
		string calldata _args2,
		string calldata _args3,
		string calldata _args4,
		string calldata _args5
	) external returns (bool);

	function authenticatedCallback(address _property, bytes32 _idHash)
		external
		returns (address);

	function deauthenticate(address _metrics) external;

	function schema() external view returns (string memory);

	function behavior() external view returns (address);

	function enabled() external view returns (bool);

	function votingEndBlockNumber() external view returns (uint256);

	function toEnable() external;
}
