/* solhint-disable const-name-snakecase */
pragma solidity 0.5.17;

import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {TreasuryFee} from "contracts/src/policy/TreasuryFee.sol";

/**
 * TreasuryFee is a contract that changes the `rewards` of DIP7.
 */
contract GeometricMean is TreasuryFee {
	address private geometricMeanSetter;

	constructor(address _config) public TreasuryFee(_config) {}

	function setGeometricMeanSetter(address _setter) external onlyOwner {
		geometricMeanSetter = _setter;
	}
}
