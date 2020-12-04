/* solhint-disable const-name-snakecase */
pragma solidity 0.5.17;

import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {DIP7} from "contracts/src/policy/DIP7.sol";

/**
 * TreasuryFee is a contract that changes the `rewards` of DIP7.
 */
contract TreasuryFee is DIP7, Ownable {
	address private treasuryAddress;

	constructor(address _config) public DIP7(_config) {}

	function policyApproval(uint256 , uint256 )
		external
		view
		returns (bool)
	{
		return false;
	}

	function shareOfTreasury(uint256 _supply) external view returns (uint256) {
		return _supply.div(100).mul(5);
	}

	function treasury() external view returns (address) {
		return treasuryAddress;
	}

	function setTreasury(address _treasury) external onlyOwner {
		treasuryAddress = _treasury;
	}
}
