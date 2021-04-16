pragma solidity 0.5.17;

import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {IAddressConfig} from "contracts/interface/IAddressConfig.sol";
import {IUpgrader} from "contracts/interface/IUpgrader.sol";
import {IPatch} from "contracts/interface/IPatch.sol";
import {ILockup} from "contracts/interface/ILockup.sol";
import {IPolicyFactory} from "contracts/interface/IPolicyFactory.sol";
import {IUsingStorage} from "contracts/interface/IUsingStorage.sol";
import {UpgraderRole} from "contracts/upgrader/UpgraderRole.sol";

contract Upgrader is UpgraderRole, IUpgrader {
	address public addressConfig;
	address public patch;
	address public patchSetter;

	event Upgrade(string _name, address _current, address _next);

	constructor(address _config) public {
		addressConfig = _config;
	}

	function setPatch(address _patch) external onlyAdminAndOperator {
		patch = _patch;
		patchSetter = msg.sender;
	}

	function execute() external onlyAdminAndOperator {
		require(patchSetter != msg.sender, "not another operator");
		Pausable patchPause = Pausable(patch);
		require(patchPause.paused() == false, "already executed");
		Ownable(addressConfig).transferOwnership(patch);
		IPatch patchContract = IPatch(patch);
		patchContract.setConfigAddress(addressConfig);
		patchContract.run();
		patchContract.afterRun();
		patchPause.pause();
	}

	function transferOwnership(address _target) external {
		bool result = hasOperatingPrivileges(msg.sender);
		if (result == false) {
			result = patch == msg.sender;
		}
		require(result, "illegal access");
		Ownable(_target).transferOwnership(msg.sender);
	}

	function pauseDevMinter() external onlyAdminAndOperator {
		Pausable devMinter = getDevMintContract();
		devMinter.pause();
	}

	function unpauseDevMinter() external onlyAdminAndOperator {
		Pausable devMinter = getDevMintContract();
		devMinter.unpause();
	}

	function addUpgradeEvent(
		string calldata _name,
		address _current,
		address _next
	) external {
		require(msg.sender == patch, "illegal access");
		emit Upgrade(_name, _current, _next);
	}

	function forceAttachPolicy(address _nextPolicy)
		external
		onlyAdminAndOperator
	{
		address policyFactoryAddress =
			IAddressConfig(addressConfig).policyFactory();
		IPolicyFactory(policyFactoryAddress).forceAttach(_nextPolicy);
	}

	function getDevMintContract() private returns (Pausable) {
		address withdrawAddress = IAddressConfig(addressConfig).withdraw();
		address devMinter = ILockup(withdrawAddress).devMinter();
		return Pausable(devMinter);
	}
}
