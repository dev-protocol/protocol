pragma solidity ^0.5.0;

import {SafeMath} from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import {ERC20Burnable} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import {ERC20} from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {AddressValidator} from "contracts/src/common/validate/AddressValidator.sol";
import {Property} from "contracts/src/property/Property.sol";
import {VoteCounter} from "contracts/src/vote/counter/VoteCounter.sol";
import {IMarket} from "contracts/src/market/IMarket.sol";
import {Policy} from "contracts/src/policy/Policy.sol";
import {MetricsFactory} from "contracts/src/metrics/MetricsFactory.sol";
import {MetricsGroup} from "contracts/src/metrics/MetricsGroup.sol";
import {Lockup} from "contracts/src/lockup/Lockup.sol";

contract Market is UsingConfig {
	using SafeMath for uint256;
	bool public enabled;
	address public behavior;
	uint256 private _votingEndBlockNumber;
	uint256 public issuedMetrics;

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

	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5
	) public returns (address) {
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
				_args5,
				address(this)
			);
	}

	function getAuthenticationFee(address _property)
		private
		view
		returns (uint256)
	{
		uint256 tokenValue = Lockup(config().lockup()).getPropertyValue(
			_property
		);
		Policy policy = Policy(config().policy());
		MetricsGroup metricsGroup = MetricsGroup(config().metricsGroup());
		return
			policy.authenticationFee(
				metricsGroup.totalIssuedMetrics(),
				tokenValue
			);
	}

	function authenticatedCallback(address _property)
		external
		returns (address)
	{
		AddressValidator validator = new AddressValidator();
		validator.validateAddress(msg.sender, behavior);

		address sender = Property(_property).author();
		MetricsFactory metricsFactory = MetricsFactory(
			config().metricsFactory()
		);
		address metrics = metricsFactory.create(_property);
		uint256 authenticationFee = getAuthenticationFee(_property);
		ERC20 devToken = ERC20(config().token());
		uint256 balance = devToken.balanceOf(sender);
		require(authenticationFee <= balance, "insufficient balance");
		bool success = devToken.transferFrom(
			sender,
			address(this),
			authenticationFee
		);
		require(success, "transfer was failed");
		ERC20Burnable(config().token()).burn(authenticationFee);
		issuedMetrics += 1;
		return metrics;
	}

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

	function schema() external view returns (string memory) {
		return IMarket(behavior).schema();
	}
}
