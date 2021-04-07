pragma solidity 0.5.17;

import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";

/**
 * A registry contract to hold the latest contract addresses.
 * Dev Protocol will be upgradeable by this contract.
 */
contract Registry is UsingStorage {
	function set(string memory _name, address _addr) external onlyOwner {
		eternalStorage().setAddress(getKey(_name), _addr);
	}

	function get(string memory _name) external view returns (address) {
		return eternalStorage().getAddress(getKey(_name));
	}

	function getKey(string memory _name)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_registry", _name));
	}
}
