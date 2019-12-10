pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/validate/SenderValidator.sol";
import "../metrics/Metrics.sol";
import "../property/Property.sol";
import "../metrics/MetricsGroup.sol";
import "../vote/VoteCounter.sol";
import "../lockup/Lockup.sol";
import "./IMarket.sol";

contract Market is UsingConfig {
	// TODO
	// https://github.com/dev-protocol/protocol/blob/master/docs/WHITEPAPER.JA.md#metrics
	// create maoppimg key(key: Metrics Contract address  value: context)
	using SafeMath for uint256;
	bool public enabled;
	address public behavior;
	uint256 public issuedMetrics;
	uint256 private _votingEndBlockNumber;

	modifier onlyDisabledMarket(address _property) {
		require(enabled == false, "market is already enabled");
		require(
			block.number <= _votingEndBlockNumber,
			"voting deadline is over"
		);
		require(
			PropertyGroup(config().propertyGroup()).isGroup(_property),
			"this address is not property contract"
		);
		_;
	}

	constructor(address _config, address _behavior)
		public
		UsingConfig(_config)
	{
		new SenderValidator().validateSender(
			msg.sender,
			config().marketFactory()
		);
		behavior = _behavior;
		enabled = false;
		uint256 marketVotingBlocks = Policy(config().policy())
			.marketVotingBlocks();
		_votingEndBlockNumber = block.number + marketVotingBlocks;
	}

	function schema() public view returns (string memory) {
		return IMarket(behavior).schema();
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
			IMarket(behavior).authenticate(
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
		return IMarket(behavior).calculate(_metrics, _start, _end);
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
		VoteCounter voteCounter = VoteCounter(config().voteCounter());
		voteCounter.addVoteCount(msg.sender, address(this), _property, _agree);
		enabled = Policy(config().policy()).marketApproval(
			voteCounter.getAgreeCount(address(this)),
			voteCounter.getOppositeCount(address(this))
		);
	}

	// TODO Run many times
	function authenticatedCallback(address _prop) public returns (address) {
		Metrics metrics = new Metrics(_prop);
		MetricsGroup metricsGroup = MetricsGroup(config().metricsGroup());
		metricsGroup.addGroup(address(metrics));
		uint256 tokenValue = LockupPropertyValue(config().lockupPropertyValue())
			.get(metrics.property());
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
