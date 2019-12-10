pragma solidity ^0.5.0;

import "../market/MarketGroup.sol";
import "../common/storage/UsingStorage.sol";
import "../common/interface/IGroup.sol";
import "../common/validate/AddressValidator.sol";

contract MetricsGroup is UsingConfig, UsingStorage, IGroup {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external {
		AddressValidator validator = new AddressValidator();
		validator.validateAddress(_addr);
		validator.validateSender(msg.sender, config().metricsFactory());

		eternalStorage().setBool(getKey(_addr), true);
		uint256 totalCount = eternalStorage().getUint(keccak256("_totalCount"));
		totalCount++;
		eternalStorage().setUint(keccak256("_totalCount"), totalCount);
	}

	function isGroup(address _addr) external view returns (bool) {
		return eternalStorage().getBool(getKey(_addr));
	}

	function totalIssuedMetrics() public view returns (uint256) {
		return eternalStorage().getUint(keccak256("_totalCount"));
	}
}
