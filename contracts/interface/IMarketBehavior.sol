// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.17;

interface IMarketBehavior {
	function authenticate(
		address _prop,
		string calldata _args1,
		string calldata _args2,
		string calldata _args3,
		string calldata _args4,
		string calldata _args5,
		address market,
		address account
	) external returns (bool);

	function schema() external view returns (string memory);

	function getId(address _metrics) external view returns (string memory);

	function getMetrics(string calldata _id) external view returns (address);
}
