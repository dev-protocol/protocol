pragma solidity ^0.5.0;


contract IMarketBehavior {
	string public schema;

	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5,
		address market
	)
		public
		returns (
			// solium-disable-next-line indentation
			address
		);

	function calculate(
		address _metrics,
		uint256 _start,
		uint256 _end
		) external returns (bool);

	function getId(address _metrics) external view returns (string memory);
}
