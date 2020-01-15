pragma solidity ^0.5.0;

import {ERC20} from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {IPolicy} from "contracts/src/policy/IPolicy.sol";

contract TheFirstPolicy is IPolicy, UsingConfig {
	uint256 public marketVotingBlocks = 525600;
	uint256 public policyVotingBlocks = 525600;
	uint256 public lockUpBlocks = 175200;

	uint120 private constant basis = 10000000000000000000000000;
	uint120 private constant power_basis = 10000000000;
	uint64 private constant mint_per_block_and_aseet = 250000000000000;

	constructor(address _config) public UsingConfig(_config) {}

	function rewards(uint256 _lockups, uint256 _assets)
		public
		view
		returns (uint256)
	{
		uint256 max = _assets * mint_per_block_and_aseet;
		uint256 t = ERC20(config().token()).totalSupply();
		uint256 s = (_lockups * basis) / t;
		uint256 _d = basis - s;
		uint256 _p = ((12 * power_basis) - s / (basis / (10 * power_basis))) /
			2;
		uint256 p = _p / power_basis;
		uint256 rp = p + 1;
		uint256 f = _p - p * power_basis;
		uint256 d1 = _d;
		uint256 d2 = _d;
		for (uint256 i = 1; i < rp; i++) {
			d1 = (d1 * _d) / basis;
		}
		for (uint256 i = 1; i < rp + 1; i++) {
			d2 = (d2 * _d) / basis;
		}
		uint256 g = ((d1 - d2) * f) / power_basis;
		uint256 d = d1 - g;
		uint256 mint = (max * d) / basis;
		return mint;
	}

	function holdersShare(uint256 _reward, uint256 _lockups)
		public
		view
		returns (uint256)
	{
		return (_reward * 95) / 100;
	}

	function assetValue(uint256 _value, uint256 _lockups)
		public
		view
		returns (uint256)
	{
		return _lockups * _value;
	}

	function authenticationFee(uint256 total_assets, uint256 property_lockups)
		public
		view
		returns (uint256)
	{
		return total_assets * 250000000000000 - property_lockups / 1000;
	}

	function marketApproval(uint256 _up_votes, uint256 _negative_votes)
		public
		view
		returns (bool)
	{
		if (_up_votes < 9999999999999999999) {
			return false;
		}
		uint256 negative_votes = _negative_votes > 0
			? _negative_votes
			: 1000000000000000000;
		return _up_votes > negative_votes * 10;
	}

	function policyApproval(uint256 _up_votes, uint256 _negative_votes)
		public
		view
		returns (bool)
	{
		if (_up_votes < 9999999999999999999) {
			return false;
		}
		uint256 negative_votes = _negative_votes > 0
			? _negative_votes
			: 1000000000000000000;
		return _up_votes > negative_votes * 10;
	}

	function abstentionPenalty(uint256 abstentions)
		public
		view
		returns (uint256)
	{
		uint256 penalty = 0;
		if (abstentions > 9) {
			penalty = 175200;
		}
		return penalty;
	}
}
