pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../metrics/Metrics.sol";
import "../property/Property.sol";
import "../metrics/MetricsGroup.sol";
import "../vote/VoteCounter.sol";
import "../Lockup.sol";

contract Behavior {
	string public schema;

	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5
		// solium-disable-next-line no-empty-blocks
	) public returns (bool) {
		// Implementation for authentication.
	}

	function calculate(address _metrics, uint256 _start, uint256 _end)
		public
		returns (bool)
	// solium-disable-next-line no-empty-blocks
	{

		// Implementation for fetches index value.
	}
}

contract Market is UsingConfig {
	// TODO
	// https://github.com/dev-protocol/protocol/blob/master/docs/WHITEPAPER.JA.md#metrics
	// create maoppimg key(key: Metrics Contract address  value: context)
	using SafeMath for uint256;
	bool public enabled;
	address public behavior;
	uint256 public issuedMetrics;
	uint256 private _votingEndBlockNumber;
	VoteCounter private _voteCounter;

	modifier onlyDisabledMarket(address _property) {
		require(enabled == false, "market is already enabled");
		require(
			block.number <= _votingEndBlockNumber,
			"voting deadline is over"
		);
		require(
			PropertyGroup(config().propertyGroup()).isProperty(_property),
			"this address is not property contract"
		);
		_;
	}

	constructor(address _config, address _behavior)
		public
		onlyMarketFactory
		UsingConfig(_config)
	{
		behavior = _behavior;
		enabled = false;
		uint256 marketVotingBlocks = Policy(config().policy())
			.marketVotingBlocks();
		_votingEndBlockNumber = block.number + marketVotingBlocks;
		_voteCounter = new VoteCounter(_config);
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
			msg.sender == Property(_prop).author(),
			"only owner of property contract"
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
	function vote(address _property, bool _agree)
		public
		onlyDisabledMarket(_property)
	{
		_voteCounter.addVoteCount(msg.sender, _property, _agree);
		enabled = Policy(config().policy()).marketApproval(
			_voteCounter.agreeCount(),
			_voteCounter.oppositeCount()
		);
	}

	function authenticatedCallback(address _prop) public returns (address) {
		Metrics metrics = new Metrics(_prop);
		MetricsGroup metricsGroup = MetricsGroup(config().metricsGroup());
		metricsGroup.addMetrics(address(metrics));
		uint256 tokenValue = Lockup(config().lockup()).getTokenValueByProperty(
			metrics.property()
		);
		Policy policy = Policy(config().policy());
		uint256 authenticationFee = policy.authenticationFee(
			metricsGroup.totalIssuedMetrics(),
			tokenValue
		);
		ERC20Burnable(config().token()).burnFrom(msg.sender, authenticationFee);
		issuedMetrics += 1;
		return address(metrics);
	}
}
