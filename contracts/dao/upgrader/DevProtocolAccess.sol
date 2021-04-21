pragma solidity 0.5.17;

// prettier-ignore
import {ERC20Mintable} from "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {IAddressConfig} from "contracts/interface/IAddressConfig.sol";
import {IDevMinter} from "contracts/interface/IDevMinter.sol";
import {ILockup} from "contracts/interface/ILockup.sol";
import {IPolicyFactory} from "contracts/interface/IPolicyFactory.sol";
import {IDevProtocolAccess} from "contracts/interface/IDevProtocolAccess.sol";
import {PatchProvider} from "contracts/dao/upgrader/PatchProvider.sol";

contract DevProtocolAccess is PatchProvider, IDevProtocolAccess {
	address public addressConfig;

	constructor(address _config) public {
		addressConfig = _config;
	}

	function transferOwnership(address _target) external {
		bool result = hasOperatingPrivileges(msg.sender);
		if (result == false) {
			result = isPatchAddress(msg.sender);
		}
		require(result, "illegal access");
		Ownable(_target).transferOwnership(msg.sender);
	}

	function renounceMinter() external onlyAdminAndOperator {
		IDevMinter devMinter = getDevMintContract();
		devMinter.renounceMinter();
	}

	function addMinter(address _account) external onlyAdminAndOperator {
		address token = IAddressConfig(addressConfig).token();
		ERC20Mintable(token).addMinter(_account);
	}

	function forceAttachPolicy(address _nextPolicy)
		external
		onlyAdminAndOperator
	{
		address policyFactoryAddress =
			IAddressConfig(addressConfig).policyFactory();
		IPolicyFactory(policyFactoryAddress).forceAttach(_nextPolicy);
	}

	function getDevMintContract() private returns (IDevMinter) {
		address withdrawAddress = IAddressConfig(addressConfig).withdraw();
		address devMinter = ILockup(withdrawAddress).devMinter();
		return IDevMinter(devMinter);
	}
}
