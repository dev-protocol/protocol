pragma solidity 0.5.17;

contract IPropertyFactory {
	function create(
		string calldata _name,
		string calldata _symbol,
		address _author
	)
		external
		returns (
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
			bool
		);
}
