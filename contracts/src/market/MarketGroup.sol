pragma solidity ^0.5.0;

import "../common/config/UsingConfig.sol";
import "../common/modifier/UsingModifier.sol";
import "../common/storage/UsingStorage.sol";

contract MarketGroup is UsingConfig, UsingModifier, UsingStorage {
	mapping(address => bool) private _markets;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config)
		public
		UsingConfig(_config)
		UsingModifier(_config)
		UsingStorage()
	{}

	function getKey(address _market) private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_marketGroup", _market));
	}

	function isMarket(address _market) public view returns (bool) {
		return eternalStorage().getBool(getKey(_market));
	}

	function addMarket(address _market) public onlyMarketFactory {
		eternalStorage().setBool(getKey(_market), true);
	}
}
