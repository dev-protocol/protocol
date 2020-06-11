pragma solidity ^0.5.0;

import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";

contract AllocatorStorage is UsingStorage {
	mapping(address => address) private property_n_metrics;

	constructor() public UsingStorage() {
		property_n_metrics[0x05BC991269a9730232a65ea7C471ABcC7D86A5B3] = 0xFEfC8Ffb329b6DfE755d24F86A19f604CEbDf3ce;
		// more...
	}

	// Last Block Number
	function getLastBlockNumber(address _address)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getLastBlockNumberKey(property_n_metrics[_address])
			);
	}

	function getLastBlockNumberKey(address _metrics)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_lastBlockNumber", _metrics));
	}
}
