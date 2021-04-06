/* solhint-disable const-name-snakecase */
pragma solidity 0.5.17;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {TreasuryFee} from "contracts/src/policy/TreasuryFee.sol";
import {ILockup} from "contracts/interface/ILockup.sol";

contract Patch662 is TreasuryFee {
	using SafeMath for uint256;

	constructor(address _config) public TreasuryFee(_config) {}

	function marketApproval(uint256 upVotes, uint256)
		external
		view
		returns (bool)
	{
		address lockup = config().lockup();
		uint256 allValue = ILockup(lockup).getAllValue();
		uint256 border = allValue.mul(99).div(100);
		return upVotes > border;
	}
}
