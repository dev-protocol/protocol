pragma solidity ^0.5.0;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {Killable} from "contracts/src/common/lifecycle/Killable.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {IPolicy} from "contracts/src/policy/IPolicy.sol";

contract Policy is Killable, UsingConfig, UsingValidator {
	using SafeMath for uint256;
	IPolicy private _policy;
	uint256 private _votingEndBlockNumber;

	constructor(address _config, address _innerPolicyAddress)
		public
		UsingConfig(_config)
	{
		addressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);

		_policy = IPolicy(_innerPolicyAddress);
		setVotingEndBlockNumber();
	}

	function voting() public view returns (bool) {
		return block.number <= _votingEndBlockNumber;
	}

	function rewards(uint256 _lockups, uint256 _assets)
		external
		view
		returns (uint256)
	{
		return _policy.rewards(_lockups, _assets);
	}

	function holdersShare(uint256 _amount, uint256 _lockups)
		external
		view
		returns (uint256)
	{
		return _policy.holdersShare(_amount, _lockups);
	}

	function assetValue(uint256 _value, uint256 _lockups)
		external
		view
		returns (uint256)
	{
		return _policy.assetValue(_value, _lockups);
	}

	function authenticationFee(uint256 _assets, uint256 _propertyAssets)
		external
		view
		returns (uint256)
	{
		return _policy.authenticationFee(_assets, _propertyAssets);
	}

	function marketApproval(uint256 _agree, uint256 _opposite)
		external
		view
		returns (bool)
	{
		return _policy.marketApproval(_agree, _opposite);
	}

	function policyApproval(uint256 _agree, uint256 _opposite)
		external
		view
		returns (bool)
	{
		return _policy.policyApproval(_agree, _opposite);
	}

	function marketVotingBlocks() external view returns (uint256) {
		return _policy.marketVotingBlocks();
	}

	function policyVotingBlocks() external view returns (uint256) {
		return _policy.policyVotingBlocks();
	}

	function abstentionPenalty(uint256 _count) external view returns (uint256) {
		return _policy.abstentionPenalty(_count);
	}

	function lockUpBlocks() external view returns (uint256) {
		return _policy.lockUpBlocks();
	}

	function setVotingEndBlockNumber() private {
		if (config().policy() == address(0)) {
			return;
		}
		uint256 tmp = Policy(config().policy()).policyVotingBlocks();
		_votingEndBlockNumber = block.number.add(tmp);
	}
}
