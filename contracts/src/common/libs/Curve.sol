/* solhint-disable const-name-snakecase */
pragma solidity 0.5.17;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";

contract Curve {
	using SafeMath for uint256;
	uint256 private constant basis = 10000000000000000000000000;
	uint256 private constant power_basis = 10000000000;

	/**
	 * @dev From the passed variables, calculate the amount of reward reduced along the curve.
	 * @param _lockups Total number of locked up tokens.
	 * @param _assets Total number of authenticated assets.
	 * @param _totalSupply Total supply the token.
	 * @param _mintPerBlockAndAseet Maximum number of reward per block per asset.
	 * @return Calculated reward amount per block per asset.
	 */
	function curveRewards(
		uint256 _lockups,
		uint256 _assets,
		uint256 _totalSupply,
		uint256 _mintPerBlockAndAseet
	) internal pure returns (uint256) {
		uint256 t = _totalSupply;
		uint256 s = (_lockups.mul(basis)).div(t);
		uint256 assets = _assets.mul(basis.sub(s));
		uint256 max = assets.mul(_mintPerBlockAndAseet);
		uint256 _d = basis.sub(s);
		uint256 _p = (
			(power_basis.mul(12)).sub(s.div((basis.div((power_basis.mul(10))))))
		).div(2);
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
		mint = mint.div(basis).div(basis);
		return mint;
	}
}
