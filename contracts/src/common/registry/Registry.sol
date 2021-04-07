pragma solidity 0.5.17;

import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {EternalStorage} from "contracts/src/common/storage/EternalStorage.sol";
import {IRegistry} from "contracts/interface/IRegistry.sol";

/**
 * A registry contract to hold the latest contract addresses.
 * Dev Protocol will be upgradeable by this contract.
 */
contract Registry is UsingStorage, IRegistry {
	/**
	 * Set the latest contract address.
	 * Only the owner and PolocyFactory can execute this function.
	 */
	function set(string calldata _name, address _addr) external {
		EternalStorage storageInstance = eternalStorage();
		if (_name == "policy") {
			address policyFactory =
				storageInstance.getAddress(getKey("PolicyFactory"));
			require(
				msg.sender == policyFactory,
				"caller is not the PolicyFactory"
			);
		} else {
			require(isOwner(), "Ownable: caller is not the owner");
		}
		storageInstance.setAddress(getKey(_name), _addr);
	}

	/**
	 * Get the latest contract address.
	 */
	function get(string calldata _name) external view returns (address) {
		return eternalStorage().getAddress(getKey(_name));
	}

	/**
	 * Get the registry key.
	 */
	function getKey(string memory _name) private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_registry", _name));
	}
}
