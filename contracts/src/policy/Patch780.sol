/* solhint-disable const-name-snakecase */
pragma solidity 0.5.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TreasuryFee.sol";

contract Patch780 is TreasuryFee {
	uint256 private constant mint_per_block_and_aseet = 132000000000000;

	constructor(address _config) public TreasuryFee(_config) {}

	function rewards(uint256 _lockups, uint256 _assets)
		external
		view
		returns (uint256)
	{
		uint256 totalSupply = IERC20(config().token()).totalSupply();
		return
			curveRewards(
				_lockups,
				_assets,
				totalSupply,
				mint_per_block_and_aseet
			);
	}
}
