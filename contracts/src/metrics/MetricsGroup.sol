pragma solidity ^0.5.0;

import "../market/MarketGroup.sol";
import "../common/storage/UsingStorage.sol";

contract MetricsGroup is UsingConfig, UsingStorage {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addMetrics(address _metrics) public {
		require(
			MarketGroup(config().marketGroup()).isMarket(msg.sender),
			"only market contract"
		);
		require(_metrics != address(0), "metrics is an invalid address");
		eternalStorage().setBool(getKey(_metrics), true);
		uint256 totalCount = eternalStorage().getUint(keccak256("_totalCount"));
		totalCount++;
		eternalStorage().setUint(keccak256("_totalCount"), totalCount);
	}

	function getKey(address _metrics) private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_metricsGroup", _metrics));
	}

	function isMetrics(address _metrics) public view returns (bool) {
		return eternalStorage().getBool(getKey(_metrics));
	}

	function totalIssuedMetrics() public view returns (uint256) {
		return eternalStorage().getUint(keccak256("_totalCount"));
	}
}
