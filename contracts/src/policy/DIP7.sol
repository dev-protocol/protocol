pragma solidity 0.5.17;

import {DIP3} from "contracts/src/policy/DIP3.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * DIP7 is a contract that changes the `rewards` of DIP3.
 */
contract DIP7 is DIP3 {
	uint256 private constant basis = 10000000000000000000000000;
	uint256 private constant power_basis = 10000000000;
	uint256 private constant mint_per_block_and_aseet = 120000000000000;

	constructor(address _config) public DIP3(_config) {}

	function rewards(uint256 _lockups, uint256 _assets)
		external
		view
		returns (uint256)
	{
		uint256 t = ERC20(config().token()).totalSupply();
		uint256 s = (_lockups.mul(basis)).div(t);
		uint256 assets = _assets.mul(basis.sub(s));
		uint256 max = assets.mul(mint_per_block_and_aseet);
		uint256 _d = basis.sub(s);
		uint256 _p = (
			(power_basis.mul(12)).sub(s.div((basis.div((power_basis.mul(10))))))
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
		mint = mint.div(basis).div(basis);
		return mint;
	}
}
