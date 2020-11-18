pragma solidity 0.5.17;

import {AddressConfig} from "contracts/src/common/config/AddressConfig.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";

contract UsingConfigTest is UsingConfig {
	constructor(address _config) public UsingConfig(_config) {}

	function getConfig() external view returns (AddressConfig) {
		return config();
	}
}
