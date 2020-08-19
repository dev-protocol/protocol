pragma solidity ^0.5.0;

interface IMarketBehavior {
	function authenticate(
		address _prop,
		string calldata _args1,
		string calldata _args2,
		string calldata _args3,
		string calldata _args4,
		string calldata _args5,
		address market
	)
		external
		returns (
			// solium-disable-next-line indentation
			bool
		);

	function schema() external view returns (string memory);

	function getId(address _metrics) external view returns (string memory);

	function getMetrics(string calldata _id) external view returns (address);
}
