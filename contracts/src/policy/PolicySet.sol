pragma solidity ^0.5.0;

import "../market/MarketGroup.sol";
import "../common/storage/UsingStorage.sol";
import "../common/validate/AddressValidator.sol";


contract PolicySet is UsingConfig, UsingStorage {
	AddressValidator validator = new AddressValidator();

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addSet(address _addr) external {
		validator.validateDefault(_addr);
		validator.validateSender(msg.sender, config().policyFactory());

		uint256 index = eternalStorage().getUint(keccak256("_policySetIndex"));
		bytes32 key = getKey(index);
		eternalStorage().setAddress(key, _addr);
		index++;
		eternalStorage().setUint(keccak256("_policySetIndex"), index);
	}

	function deleteAll() external {
		validator.validateSender(msg.sender, config().policyFactory());

		uint256 index = eternalStorage().getUint(keccak256("_policySetIndex"));
		for (uint256 i = 0; i < index; i++) {
			bytes32 key = getKey(index);
			eternalStorage().setAddress(key, address(0));
		}
		eternalStorage().setUint(keccak256("_policySetIndex"), 0);
	}

	function count() external view returns (uint256) {
		return eternalStorage().getUint(keccak256("_policySetIndex"));
	}

	function get(uint256 _index) external view returns (address) {
		bytes32 key = getKey(_index);
		return eternalStorage().getAddress(key);
	}

	function getKey(uint256 _index) private pure returns (bytes32) {
		return keccak256(abi.encodePacked(_index));
	}
}
