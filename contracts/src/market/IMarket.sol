pragma solidity ^0.5.0;

contract IMarket {
	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5
	)
		public
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

	function enabled() external view returns (bool);

	function votingEndBlockNumber() external view returns (uint256);

	function toEnable() external;

	// TODO 他のやつもやる
}
