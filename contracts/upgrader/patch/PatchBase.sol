pragma solidity 0.5.17;

import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import { IUpgrader } from "contracts/interface/IUpgrader.sol";
import {IPatch} from "contracts/interface/IPatch.sol";
import {IUsingStorage} from "contracts/interface/IUsingStorage.sol";
import {IAddressConfig} from "contracts/interface/IAddressConfig.sol";

contract PatchBase is Pausable, IPatch {
	address public upgrader;
	address public config;

	constructor(address _upgrader) public {
		upgrader = _upgrader;
	}

	modifier onlyUpgrader() {
		require(msg.sender == upgrader, "illegal access");
		_;
	}

	function setConfigAddress(address _config) external onlyUpgrader whenNotPaused {
		config = _config;
	}

	function afterRun() external onlyUpgrader whenNotPaused {
		Ownable(config).transferOwnership(upgrader);
	}

	function afterDeployAllocator(address _next) internal {
		IAddressConfig addressConfig = IAddressConfig(config);
		addressConfig.setAllocator(_next);
	}

	function afterDeployMarketFactory(address _next) internal {
		IAddressConfig addressConfig = IAddressConfig(config);
		addressConfig.setMarketFactory(_next);
	}

	function afterDeployMetricsFactory(address _next) internal {
		IAddressConfig addressConfig = IAddressConfig(config);
		addressConfig.setMetricsFactory(_next);
	}

	function afterDeployPropertyFactory(address _next) internal {
		IAddressConfig addressConfig = IAddressConfig(config);
		addressConfig.setPropertyFactory(_next);
	}

	function afterDeployWithdraw(address _next) internal {
		IAddressConfig addressConfig = IAddressConfig(config);
		address current = addressConfig.withdraw();
		afterDeployUsingStorage(current, _next);
		addressConfig.setWithdraw(_next);
	}

	function afterDeployVoteCounter(address _next) internal {
		IAddressConfig addressConfig = IAddressConfig(config);
		address current = addressConfig.voteCounter();
		afterDeployUsingStorage(current, _next);
		addressConfig.setVoteCounter(_next);
	}

	function afterDeployPropertyGroup(address _next) internal {
		IAddressConfig addressConfig = IAddressConfig(config);
		address current = addressConfig.propertyGroup();
		afterDeployUsingStorage(current, _next);
		addressConfig.setPropertyGroup(_next);
	}

	function afterDeployPolicyGroup(address _next) internal {
		IAddressConfig addressConfig = IAddressConfig(config);
		address current = addressConfig.policyGroup();
		afterDeployUsingStorage(current, _next);
		addressConfig.setPolicyGroup(_next);
	}

	function afterDeployPolicyFactory(address _next) internal {
		IAddressConfig addressConfig = IAddressConfig(config);
		address current = addressConfig.policyFactory();
		IUpgrader(upgrader).transferOwnership(current);
		Ownable(current).transferOwnership(upgrader);
		Ownable(_next).transferOwnership(upgrader);
		addressConfig.setPolicyFactory(_next);
	}

	function afterDeployMetricsGroup(address _next) internal {
		IAddressConfig addressConfig = IAddressConfig(config);
		address current = addressConfig.metricsGroup();
		afterDeployUsingStorage(current, _next);
		addressConfig.setMetricsGroup(_next);
	}

	function afterDeployMarketGroup(address _next) internal {
		IAddressConfig addressConfig = IAddressConfig(config);
		address current = addressConfig.marketGroup();
		afterDeployUsingStorage(current, _next);
		addressConfig.setMarketGroup(_next);
	}

	function afterDeployLockup(address _next) internal {
		IAddressConfig addressConfig = IAddressConfig(config);
		address current = addressConfig.lockup();
		afterDeployUsingStorage(current, _next);
		addressConfig.setLockup(_next);
	}

	function afterDeployUsingStorage(address _current, address _next) private {
		IUpgrader(upgrader).transferOwnership(_current);
		changeStorageOwner(_current, _next);
		Ownable(_current).transferOwnership(upgrader);
		Ownable(_next).transferOwnership(upgrader);
	}

	function changeStorageOwner(address _current, address _next) private {
		IUsingStorage current = IUsingStorage(_current);
		IUsingStorage next = IUsingStorage(_next);
		address storageAddress = current.getStorageAddress();
		next.setStorage(storageAddress);
		current.changeOwner(_next);
	}

	function run() external;
}
