pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/validate/AddressValidator.sol";
import "../property/Property.sol";
import "../metrics/MetricsGroup.sol";
import "../metrics/MetricsFactory.sol";
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

	constructor(address _config, address _behavior)
		public
		UsingConfig(_config)
	{
		new AddressValidator().validateAddress(
			msg.sender,
			config().marketFactory()
		);

		behavior = _behavior;
		enabled = false;
		uint256 marketVotingBlocks = Policy(config().policy())
			.marketVotingBlocks();
		_votingEndBlockNumber = block.number + marketVotingBlocks;
	}

	function calculate(address _metrics, uint256 _start, uint256 _end)
		external
		returns (bool)
	{
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);

		return IMarket(behavior).calculate(_metrics, _start, _end);
	}

	// TODO Not called from anywhere
	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5
	) public returns (bool) {
		new AddressValidator().validateAddress(
			msg.sender,
			Property(_prop).author()
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

	/**
	 * In advance, msg.sender is supposed to approve same amount DEV token as vote number.
	 *
	 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20Burnable.sol
	 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol
	 */
	function vote(address _property, bool _agree) external {
		new AddressValidator().validateGroup(
			_property,
			config().propertyGroup()
		);
		require(enabled == false, "market is already enabled");
		require(
			block.number <= _votingEndBlockNumber,
			"voting deadline is over"
		);

		VoteCounter voteCounter = VoteCounter(config().voteCounter());
		voteCounter.addVoteCount(msg.sender, _property, _agree);
		enabled = Policy(config().policy()).marketApproval(
			voteCounter.getAgreeCount(address(this)),
			voteCounter.getOppositeCount(address(this))
		);
	}

	// TODO Run many times
	function authenticatedCallback(address _property)
		external
		returns (address)
	{
		new AddressValidator().validateGroup(
			_property,
			config().propertyGroup()
		);

		MetricsFactory metricsFactory = MetricsFactory(
			config().metricsFactory()
		);
		address metrics = metricsFactory.createMetrics(_property);
		uint256 tokenValue = Lockup(config().lockup())
			.getPropertyValue(_property);
		Policy policy = Policy(config().policy());
		MetricsGroup metricsGroup = MetricsGroup(config().metricsGroup());
		uint256 authenticationFee = policy.authenticationFee(
			metricsGroup.totalIssuedMetrics(),
			tokenValue
		);
		ERC20Burnable(config().token()).burnFrom(msg.sender, authenticationFee);
		issuedMetrics += 1;
		return metrics;
	}

	function schema() public view returns (string memory) {
		return IMarket(behavior).schema();
	}
}
