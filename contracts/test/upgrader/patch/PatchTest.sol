pragma solidity 0.5.17;

import {PatchBase} from "contracts/upgrader/patch/PatchBase.sol";
import {Allocator} from "contracts/src/allocator/Allocator.sol";
import {MarketFactory} from "contracts/src/market/MarketFactory.sol";
import {MetricsFactory} from "contracts/src/metrics/MetricsFactory.sol";
import {PropertyFactory} from "contracts/src/property/PropertyFactory.sol";
import {Withdraw} from "contracts/src/withdraw/Withdraw.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";

contract PatchPlane is PatchBase {
	constructor(address _upgrader) public PatchBase(_upgrader) {}

	function run() external onlyUpgrader whenNotPaused {}
}

contract PatchAllocator is PatchBase {
	constructor(address _upgrader) public PatchBase(_upgrader) {}

	function run() external onlyUpgrader whenNotPaused {
		Allocator tmp = new Allocator(config);
		afterDeployAllocator(address(tmp));
	}
}

contract PatchMarketFactory is PatchBase {
	constructor(address _upgrader) public PatchBase(_upgrader) {}

	function run() external onlyUpgrader whenNotPaused {
		MarketFactory tmp = new MarketFactory(config);
		afterDeployMarketFactory(address(tmp));
	}
}

contract PatchMetricsFactory is PatchBase {
	constructor(address _upgrader) public PatchBase(_upgrader) {}

	function run() external onlyUpgrader whenNotPaused {
		MetricsFactory tmp = new MetricsFactory(config);
		afterDeployMetricsFactory(address(tmp));
	}
}

contract PatchPropertyFactory is PatchBase {
	constructor(address _upgrader) public PatchBase(_upgrader) {}

	function run() external onlyUpgrader whenNotPaused {
		PropertyFactory tmp = new PropertyFactory(config);
		afterDeployPropertyFactory(address(tmp));
	}
}

contract PatchWithdraw is PatchBase {
	constructor(address _upgrader) public PatchBase(_upgrader) {}

	function run() external onlyUpgrader whenNotPaused {
		Withdraw tmp =
			new Withdraw(config, 0x6A0A88907548a5601857191aAD8727884881Ac46);
		afterDeployWithdraw(address(tmp));
	}
}

contract StorageContract is UsingStorage {
	constructor() public UsingStorage() {}
}
