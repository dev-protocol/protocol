pragma solidity ^0.5.0;

import "./UseState.sol";
import "./Metrics.sol";
import "./Property.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Behavior {
	string public schema;

	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5
	) public returns (bool) {
		// Implementation for authentication.
	}

	function calculate(address _metrics, uint256 _start, uint256 _end)
		public
		returns (bool)
	{
		// Implementation for fetches index value.
	}
}

contract Market is UseState {
	using SafeMath for uint256;
	bool public enabled;
	address public behavior;
	uint256 public issuedMetrics;
	uint256 public totalVotes;

	modifier onlyDisabledMarket() {
		require(enabled == false, "Market is already enabled.");
		_;
	}

	constructor(address _behavior, bool _enabled) public {
		behavior = _behavior;
		enabled = _enabled;
	}

	function schema() public view returns (string memory) {
		return Behavior(behavior).schema();
	}

	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5
	) public returns (bool) {
		require(
			msg.sender == Property(_prop).owner(),
			"Only owner of Property Contract"
		);
		return
			Behavior(behavior).authenticate(
				_prop,
				_args1,
				_args2,
				_args3,
				_args4,
				_args5
			);
	}

	function calculate(address _metrics, uint256 _start, uint256 _end)
		public
		returns (bool)
	{
		return Behavior(behavior).calculate(_metrics, _start, _end);
	}

	/**
	 * In advance, msg.sender is supposed to approve same amount DEV token as vote number.
	 *
	 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20Burnable.sol
	 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol
	 */
	function vote(uint256 _tokenNumber) public onlyDisabledMarket {
		ERC20Burnable(getToken()).burnFrom(msg.sender, _tokenNumber);
		totalVotes = totalVotes + _tokenNumber;
		uint256 DEVtotalSupply = ERC20Burnable(getToken()).totalSupply();
		if (totalVotes >= DEVtotalSupply.div(10)) {
			enabled = true;
		}
	}

	function authenticatedCallback(address _prop) public returns (address) {
		Metrics metrics = new Metrics(_prop);
		addMetrics(address(metrics));
		issuedMetrics += 1;
		return address(metrics);
	}
}
