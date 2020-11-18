pragma solidity 0.5.17;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {IMetricsGroup} from "contracts/src/metrics/IMetricsGroup.sol";
import {IMetrics} from "contracts/src/metrics/IMetrics.sol";

contract MetricsGroup is
	UsingConfig,
	UsingStorage,
	UsingValidator,
	IMetricsGroup
{
	using SafeMath for uint256;

	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external {
		addressValidator().validateAddress(
			msg.sender,
			config().metricsFactory()
		);

		require(isGroup(_addr) == false, "already enabled");
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
		addressValidator().validateAddress(
			msg.sender,
			config().metricsFactory()
		);

		require(isGroup(_addr), "address is not group");
		eternalStorage().setBool(getGroupKey(_addr), false);
		address property = IMetrics(_addr).property();
		uint256 totalCount = eternalStorage().getUint(getTotalCountKey());
		uint256 metricsCountPerProperty = getMetricsCountPerProperty(property);
		totalCount = totalCount.sub(1);
		metricsCountPerProperty = metricsCountPerProperty.sub(1);
		setTotalIssuedMetrics(totalCount);
		setMetricsCountPerProperty(property, metricsCountPerProperty);
	}

	function setMetricsCountPerProperty(address _property, uint256 _value)
		internal
	{
		return
			eternalStorage().setUint(
				getMetricsCountPerPropertyKey(_property),
				_value
			);
	}

	function getMetricsCountPerProperty(address _property)
		public
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(getMetricsCountPerPropertyKey(_property));
	}

	function hasAssets(address _property) public view returns (bool) {
		return getMetricsCountPerProperty(_property) > 0;
	}

	function setTotalIssuedMetrics(uint256 _value) internal {
		eternalStorage().setUint(getTotalCountKey(), _value);
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

	function getMetricsCountPerPropertyKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(abi.encodePacked("_metricsCountPerProperty", _property));
	}
}
