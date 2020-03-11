pragma solidity ^0.5.0;

import {Killable} from "contracts/src/common/lifecycle/Killable.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";


contract AllocatorStorage is
	UsingStorage,
	Killable
{
	constructor(address _config) public UsingStorage() {}

	// lastAssetValueEachMarketPerBlock
	function setLastAssetValueEachMarketPerBlock(address _market, uint256 value)
		external
	{
		eternalStorage().setUint(
			getLastAssetValueEachMarketPerBlockKey(_market),
			value
		);
	}

	function getLastAssetValueEachMarketPerBlock(address _market)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getLastAssetValueEachMarketPerBlockKey(_market)
			);
	}

	function getLastAssetValueEachMarketPerBlockKey(address _addr)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_lastAssetValueEachMarketPerBlock", _addr)
			);
	}
}
