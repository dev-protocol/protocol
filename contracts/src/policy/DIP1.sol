/* solhint-disable const-name-snakecase */
/* solhint-disable var-name-mixedcase */
pragma solidity 0.5.17;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {IPolicy} from "contracts/interface/IPolicy.sol";

/**
 * DIP1 is a contract that simply changed TheFirstPolicy to DIP numbering.
 */
contract DIP1 is IPolicy, UsingConfig {
	using SafeMath for uint256;
	uint256 public marketVotingBlocks = 525600;
	uint256 public policyVotingBlocks = 525600;

	uint256 private constant basis = 10000000000000000000000000;
	uint256 private constant power_basis = 10000000000;
	uint256 private constant mint_per_block_and_aseet = 250000000000000;

	constructor(address _config) public UsingConfig(_config) {}

	function rewards(uint256 _lockups, uint256 _assets)
		external
		view
		returns (uint256)
	{
		uint256 max = _assets.mul(mint_per_block_and_aseet);
		uint256 t = ERC20(config().token()).totalSupply();
		uint256 s = (_lockups.mul(basis)).div(t);
		uint256 _d = basis.sub(s);
		uint256 _p =
			(
				(power_basis.mul(12)).sub(
					s.div((basis.div((power_basis.mul(10)))))
				)
			)
				.div(2);
		uint256 p = _p.div(power_basis);
		uint256 rp = p.add(1);
		uint256 f = _p.sub(p.mul(power_basis));
		uint256 d1 = _d;
		uint256 d2 = _d;
		for (uint256 i = 0; i < p; i++) {
			d1 = (d1.mul(_d)).div(basis);
		}
		for (uint256 i = 0; i < rp; i++) {
			d2 = (d2.mul(_d)).div(basis);
		}
		uint256 g = ((d1.sub(d2)).mul(f)).div(power_basis);
		uint256 d = d1.sub(g);
		uint256 mint = max.mul(d);
		mint = mint.div(basis);
		return mint;
	}

	function holdersShare(uint256 _reward, uint256 _lockups)
		external
		view
		returns (uint256)
	{
		return _lockups > 0 ? (_reward.mul(51)).div(100) : _reward;
	}

	function authenticationFee(uint256 total_assets, uint256 property_lockups)
		external
		view
		returns (uint256)
	{
		uint256 a = total_assets.div(10000);
		uint256 b = property_lockups.div(100000000000000000000000);
		if (a <= b) {
			return 0;
		}
		return a.sub(b);
	}

	function marketApproval(uint256 _up_votes, uint256 _negative_votes)
		external
		view
		returns (bool)
	{
		if (_up_votes < 9999999999999999999) {
			return false;
		}
		uint256 negative_votes =
			_negative_votes > 0 ? _negative_votes : 1000000000000000000;
		return _up_votes > negative_votes.mul(10);
	}

	function policyApproval(uint256 _up_votes, uint256 _negative_votes)
		external
		view
		returns (bool)
	{
		if (_up_votes < 9999999999999999999) {
			return false;
		}
		uint256 negative_votes =
			_negative_votes > 0 ? _negative_votes : 1000000000000000000;
		return _up_votes > negative_votes.mul(10);
	}

	function shareOfTreasury(uint256) external view returns (uint256) {
		return 0;
	}

	function treasury() external view returns (address) {
		return address(0);
	}

	function capSetter() external view returns (address) {
		return address(0);
	}
}
