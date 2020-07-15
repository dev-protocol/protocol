pragma solidity ^0.5.0;

contract IPropertyFactory {
	function create(
		string calldata _name,
		string calldata _symbol,
		address _author
		// solium-disable-next-line indentation
	) external returns (address);
}
