pragma solidity ^0.5.0;

import "../market/MarketGroup.sol";
import "../common/storage/UsingStorage.sol";
import "../common/interface/IGroup.sol";

contract MetricsGroup is UsingConfig, UsingStorage, IGroup {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external {
		require(
			MarketGroup(config().marketGroup()).isGroup(msg.sender),
			"only market contract"
		);
		require(_addr != address(0), "metrics is an invalid address");
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
