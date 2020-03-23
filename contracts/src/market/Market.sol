pragma solidity ^0.5.0;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Temporarily} from "contracts/src/common/lifecycle/Temporarily.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {Property} from "contracts/src/property/Property.sol";
import {VoteCounter} from "contracts/src/vote/counter/VoteCounter.sol";
import {IMarket} from "contracts/src/market/IMarket.sol";
import {IMarketBehavior} from "contracts/src/market/IMarketBehavior.sol";
import {Policy} from "contracts/src/policy/Policy.sol";
import {MetricsFactory} from "contracts/src/metrics/MetricsFactory.sol";
import {MetricsGroup} from "contracts/src/metrics/MetricsGroup.sol";
import {Lockup} from "contracts/src/lockup/Lockup.sol";
import {Dev} from "contracts/src/dev/Dev.sol";


contract Market is Temporarily, UsingConfig, IMarket, UsingValidator {
	using SafeMath for uint256;
	bool public enabled;
	address public behavior;
	uint256 private _votingEndBlockNumber;
	uint256 public issuedMetrics;
	mapping(bytes32 => bool) private idMap;
	mapping(address => bytes32) private idHashMetricsMap;

	constructor(address _config, address _behavior)
		public
		UsingConfig(_config)
	{
		addressValidator().validateAddress(
			msg.sender,
			config().marketFactory()
		);

		behavior = _behavior;
		enabled = false;
		uint256 marketVotingBlocks = Policy(config().policy())
			.marketVotingBlocks();
		_votingEndBlockNumber = block.number.add(marketVotingBlocks);
	}

	function propertyValidation(address _prop) internal view {
		addressValidator().validateAddress(
			msg.sender,
			Property(_prop).author()
		);
		require(enabled, "market is not enabled");
	}

	modifier onlyPropertyAuthor(address _prop) {
		propertyValidation(_prop);
		_;
	}

	modifier onlyLinkedPropertyAuthor(address _metrics) {
		address _prop = Metrics(_metrics).property();
		propertyValidation(_prop);
		_;
	}

	function toEnable() external {
		addressValidator().validateAddress(
			msg.sender,
			config().marketFactory()
		);
		enabled = true;
	}

	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5
	) public onlyPropertyAuthor(_prop) returns (address) {
		uint256 len = bytes(_args1).length;
		require(len > 0, "id is required");

		return
			IMarketBehavior(behavior).authenticate(
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

	function authenticatedCallback(address _property, bytes32 _idHash)
		external
		returns (address)
	{
		addressValidator().validateAddress(msg.sender, behavior);
		require(enabled, "market is not enabled");

		require(idMap[_idHash] == false, "id is duplicated");
		idMap[_idHash] = true;
		address sender = Property(_property).author();
		MetricsFactory metricsFactory = MetricsFactory(
			config().metricsFactory()
		);
		address metrics = metricsFactory.create(_property);
		idHashMetricsMap[metrics] = _idHash;
		uint256 authenticationFee = getAuthenticationFee(_property);
		require(
			Dev(config().token()).fee(sender, authenticationFee),
			"dev fee failed"
		);
		issuedMetrics = issuedMetrics.add(1);
		return metrics;
	}

	function deauthenticate(address _metrics)
		external
		onlyLinkedPropertyAuthor(_metrics)
	{
		bytes32 idHash = idHashMetricsMap[_metrics];
		require(idMap[idHash], "not authenticated");
		idMap[idHash] = false;
		idHashMetricsMap[_metrics] = address(0);
		MetricsFactory metricsFactory = MetricsFactory(
			config().metricsFactory()
		);
		metricsFactory.destroy(_metrics);
		issuedMetrics = issuedMetrics.sub(1);
	}

	function vote(address _property, bool _agree) external {
		addressValidator().validateGroup(_property, config().propertyGroup());
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
		return IMarketBehavior(behavior).schema();
	}

	// duplicated
	function destroyMetrics(address _metrics) external enabledTemporarily {
		require(enabled, "market is not enabled");

		MetricsFactory metricsFactory = MetricsFactory(
			config().metricsFactory()
		);
		metricsFactory.destroy(_metrics);
	}
}
