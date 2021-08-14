pragma solidity 0.5.17;

import {UsingConfig} from "../../../src/common/config/UsingConfig.sol";
import {IAddressConfig} from "../../../interface/IAddressConfig.sol";

contract UsingConfigTest is UsingConfig {
	constructor(address _config) public UsingConfig(_config) {}

	function getToken() external view returns (address) {
		return config().token();
	}
}
