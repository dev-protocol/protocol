pragma solidity ^0.5.0;

import "../market/MarketGroup.sol";
import "../common/storage/UsingStorage.sol";
import "../common/interface/IGroup.sol";
import "../common/validate/AddressValidator.sol";

contract MetricsGroup is UsingConfig, UsingStorage, IGroup {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().metricsFactory()
		);

		eternalStorage().setBool(getAddressKey(_addr), true);
		uint256 totalCount = eternalStorage().getUint(getTotalCountKey());
		totalCount++;
		eternalStorage().setUint(getTotalCountKey(), totalCount);
	}

	function isGroup(address _addr) external view returns (bool) {
		return eternalStorage().getBool(getAddressKey(_addr));
	}

	function totalIssuedMetrics() public view returns (uint256) {
		return eternalStorage().getUint(getTotalCountKey());
	}

	function getTotalCountKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_totalCount"));
	}
}
