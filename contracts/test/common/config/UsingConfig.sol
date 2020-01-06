pragma solidity ^0.5.0;
import {AddressConfig} from "contracts/src/common/config/AddressConfig.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";

contract UsingConfigTest is UsingConfig {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function getConfig() external view returns (AddressConfig) {
		return config();
	}
}
