pragma solidity ^0.5.0;

import "../common/config/UsingConfig.sol";
import "../common/storage/UsingStorage.sol";
import "../common/validate/SenderValidator.sol";

contract MarketGroup is UsingConfig, UsingStorage {
	mapping(address => bool) private _markets;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config)
		public
		UsingConfig(_config)
		UsingStorage()
	{}

	function getKey(address _market) private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_marketGroup", _market));
	}

	function isMarket(address _market) public view returns (bool) {
		return eternalStorage().getBool(getKey(_market));
	}

	function addMarket(address _market) public {
		new SenderValidator().validateSender(msg.sender, config().marketFactory());
		eternalStorage().setBool(getKey(_market), true);
	}
}
