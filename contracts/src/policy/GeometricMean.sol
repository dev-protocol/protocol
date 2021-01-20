/* solhint-disable const-name-snakecase */
pragma solidity 0.5.17;

import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {TreasuryFee} from "contracts/src/policy/TreasuryFee.sol";

/**
 * GeometricMean is a contract that changes the `rewards` of DIP7.
 */
contract GeometricMean is TreasuryFee {
	address private geometricMeanSetterAddress;

	constructor(address _config) public TreasuryFee(_config) {}

	function setGeometricMeanSetter(address _setter) external onlyOwner {
		geometricMeanSetterAddress = _setter;
	}

	function geometricMeanSetter() external view returns (address) {
		return geometricMeanSetterAddress;
	}
}
