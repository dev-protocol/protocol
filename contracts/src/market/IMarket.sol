pragma solidity ^0.6.0;


interface IMarket {
	function authenticate(
		address _prop,
		string calldata _args1,
		string calldata _args2,
		string calldata _args3,
		string calldata _args4,
		string calldata _args5
	)
		external
		returns (
			// solium-disable-next-line indentation
			address
		);

	function authenticatedCallback(address _property, bytes32 _idHash)
		external
		returns (address);

	function deauthenticate(address _metrics) external;

	function vote(address _property, bool _agree) external;

	function schema() external view returns (string memory);

	function behavior() external view returns (address);
}
