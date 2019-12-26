pragma solidity ^0.5.0;

import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";

contract IMarket is UsingConfig {
	string public schema;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function authenticate(
		address _prop,
		string calldata _args1,
		string calldata _args2,
		string calldata _args3,
		string calldata _args4,
		string calldata _args5,
		address market
		// solium-disable-next-line indentation
	) external returns (address);

	function calculate(address _metrics, uint256 _start, uint256 _end)
		external
		returns (bool);
}
