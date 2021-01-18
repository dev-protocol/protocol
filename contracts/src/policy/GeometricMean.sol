/* solhint-disable const-name-snakecase */
pragma solidity 0.5.17;

import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {TreasuryFee} from "contracts/src/policy/TreasuryFee.sol";

/**
 * TreasuryFee is a contract that changes the `rewards` of DIP7.
 */
contract GeometricMean is TreasuryFee {
	address private setter;

	constructor(address _config) public TreasuryFee(_config) {}

	function geometricMeanSetter() external view returns (address) {
		return setter;
	}

	function setGeometricMeanSetter(address _setter) external onlyOwner {
		setter = _setter;
	}
}
