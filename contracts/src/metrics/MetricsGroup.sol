pragma solidity ^0.5.0;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {IMetricsGroup} from "contracts/src/metrics/IMetricsGroup.sol";

contract MetricsGroup is
	UsingConfig,
	UsingStorage,
	UsingValidator,
	IMetricsGroup
{
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external {
		addressValidator().validateAddress(
			msg.sender,
			config().metricsFactory()
		);

		require(isGroup(_addr) == false, "already enabled");
		eternalStorage().setBool(getGroupKey(_addr), true);
		uint256 totalCount = eternalStorage().getUint(getTotalCountKey());
		totalCount = totalCount.add(1);
		eternalStorage().setUint(getTotalCountKey(), totalCount);
	}

	function removeGroup(address _addr) external {
		addressValidator().validateAddress(
			msg.sender,
			config().metricsFactory()
		);

		require(isGroup(_addr), "address is not group");
		eternalStorage().setBool(getGroupKey(_addr), false);
		uint256 totalCount = eternalStorage().getUint(getTotalCountKey());
		totalCount = totalCount.sub(1);
		eternalStorage().setUint(getTotalCountKey(), totalCount);
	}

	function isGroup(address _addr) public view returns (bool) {
		return eternalStorage().getBool(getGroupKey(_addr));
	}

	function totalIssuedMetrics() external view returns (uint256) {
		return eternalStorage().getUint(getTotalCountKey());
	}

	function getTotalCountKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_totalCount"));
	}
}
