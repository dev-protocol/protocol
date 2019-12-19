pragma solidity ^0.5.0;

import {ERC20Burnable} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import {AddressValidator} from "contracts/src/common/validate/AddressValidator.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {MetricsFactory} from "contracts/src/metrics/MetricsFactory.sol";
import {MetricsGroup} from "contracts/src/metrics/MetricsGroup.sol";
import {Policy} from "contracts/src/policy/Policy.sol";
import {Lockup} from "contracts/src/lockup/Lockup.sol";

contract IMarket is UsingConfig {
	string public schema;
	uint256 public issuedMetrics;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function authenticatedCallback(address _property)
		internal
		returns (address)
	{
		new AddressValidator().validateGroup(
			_property,
			config().propertyGroup()
		);

		MetricsFactory metricsFactory = MetricsFactory(
			config().metricsFactory()
		);
		address metrics = metricsFactory.create(_property);
		uint256 tokenValue = Lockup(config().lockup()).getPropertyValue(
			_property
		);
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

	function authenticate(
		address _prop,
		string calldata _args1,
		string calldata _args2,
		string calldata _args3,
		string calldata _args4,
		string calldata _args5
		// solium-disable-next-line indentation
	) external returns (bool);

	function calculate(address _metrics, uint256 _start, uint256 _end)
		external
		returns (bool);
}
