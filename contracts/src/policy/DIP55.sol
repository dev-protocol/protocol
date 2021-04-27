/* solhint-disable const-name-snakecase */
pragma solidity 0.5.17;

import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {Patch780} from "contracts/src/policy/Patch780.sol";

/**
 * GeometricMean is a contract that changes the `rewards` of DIP7.
 */
contract DIP55 is Patch780 {
	address private capSetterAddress;

	constructor(address _config) public Patch780(_config) {}

	function setCapSetter(address _setter) external onlyOwner {
		capSetterAddress = _setter;
	}

	function capSetter() external view returns (address) {
		return capSetterAddress;
	}
}
