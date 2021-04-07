/* solhint-disable const-name-snakecase */
pragma solidity 0.5.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {DIP1} from "contracts/src/policy/DIP1.sol";
import {Curve} from "contracts/src/common/libs/Curve.sol";

/**
 * DIP7 is a contract that changes the `rewards` of DIP1.
 */
contract DIP7 is DIP1, Curve {
	uint256 private constant mint_per_block_and_aseet = 120000000000000;

	constructor(address _registry) public DIP1(_registry) {}

	function rewards(uint256 _lockups, uint256 _assets)
		external
		view
		returns (uint256)
	{
		uint256 totalSupply = IERC20(registry().get("Token")).totalSupply();
		return
			curveRewards(
				_lockups,
				_assets,
				totalSupply,
				mint_per_block_and_aseet
			);
	}
}
