pragma solidity ^0.5.0;

contract IPropertyFactory {
	function create(
		string calldata _name,
		string calldata _symbol,
		address _author
	)
		external
		returns (
			// solium-disable-next-line indentation
			address
		);

	function createAndAuthenticate(
		string calldata _name,
		string calldata _symbol,
		address _market,
		string calldata _args1,
		string calldata _args2,
		string calldata _args3
	)
		external
		returns (
			// solium-disable-next-line indentation
			bool
		);
}
