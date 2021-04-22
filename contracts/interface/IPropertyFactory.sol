// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.17;

interface IPropertyFactory {
	function create(
		string calldata _name,
		string calldata _symbol,
		address _author
	) external returns (address);

	function createAndAuthenticate(
		string calldata _name,
		string calldata _symbol,
		address _market,
		string calldata _args1,
		string calldata _args2,
		string calldata _args3
	) external returns (bool);

	function createChangeAuthorEvent(address _old, address _new) external;

	function createChangeNameEvent(string calldata _old, string calldata _new)
		external;

	function createChangeSymbolEvent(string calldata _old, string calldata _new)
		external;
}
