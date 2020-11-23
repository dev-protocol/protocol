pragma solidity 0.5.17;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {IMetricsGroup} from "contracts/interface/IMetricsGroup.sol";
import {IMetrics} from "contracts/src/metrics/IMetrics.sol";

contract MetricsGroup is UsingConfig, UsingStorage, IMetricsGroup {
	using SafeMath for uint256;

	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external {
		require(
			msg.sender == config().metricsFactory(),
			"this is illegal address"
		);

		require(
			eternalStorage().getBool(getGroupKey(_addr)) == false,
			"already enabled"
		);
		eternalStorage().setBool(getGroupKey(_addr), true);
		address property = IMetrics(_addr).property();
		uint256 totalCount = eternalStorage().getUint(getTotalCountKey());
		uint256 metricsCountPerProperty = getMetricsCountPerProperty(property);
		totalCount = totalCount.add(1);
		metricsCountPerProperty = metricsCountPerProperty.add(1);
		setTotalIssuedMetrics(totalCount);
		setMetricsCountPerProperty(property, metricsCountPerProperty);
	}

	function removeGroup(address _addr) external {
		require(
			msg.sender == config().metricsFactory(),
			"this is illegal address"
		);

		require(
			eternalStorage().getBool(getGroupKey(_addr)),
			"address is not group"
		);
		eternalStorage().setBool(getGroupKey(_addr), false);
		address property = IMetrics(_addr).property();
		uint256 totalCount = eternalStorage().getUint(getTotalCountKey());
		uint256 metricsCountPerProperty = getMetricsCountPerProperty(property);
		totalCount = totalCount.sub(1);
		metricsCountPerProperty = metricsCountPerProperty.sub(1);
		setTotalIssuedMetrics(totalCount);
		setMetricsCountPerProperty(property, metricsCountPerProperty);
	}

	function isGroup(address _addr) external view returns (bool) {
		return eternalStorage().getBool(getGroupKey(_addr));
	}

	function totalIssuedMetrics() external view returns (uint256) {
		return eternalStorage().getUint(getTotalCountKey());
	}

	function hasAssets(address _property) external view returns (bool) {
		return getMetricsCountPerProperty(_property) > 0;
	}

	function getMetricsCountPerProperty(address _property)
		private
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(getMetricsCountPerPropertyKey(_property));
	}

	function setMetricsCountPerProperty(address _property, uint256 _value)
		internal
	{
		eternalStorage().setUint(
			getMetricsCountPerPropertyKey(_property),
			_value
		);
	}

	function setTotalIssuedMetrics(uint256 _value) private {
		eternalStorage().setUint(getTotalCountKey(), _value);
	}

	function getTotalCountKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_totalCount"));
	}

	function getMetricsCountPerPropertyKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(abi.encodePacked("_metricsCountPerProperty", _property));
	}

	function getGroupKey(address _addr) private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_group", _addr));
	}
}
