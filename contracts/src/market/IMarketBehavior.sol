pragma solidity ^0.6.0;


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
			address
		);

	function calculate(address _metrics, uint256 _start, uint256 _end)
		external
		returns (bool);

	function getId(address _metrics) external view returns (string memory);

	function schema() external view returns (string memory);

}
