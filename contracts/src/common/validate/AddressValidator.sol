pragma solidity ^0.5.0;

import "contracts/src/common/interface/IGroup.sol";

contract AddressValidator {
	string constant errorMessage = "this address is not proper";

	function validateDefault(address _addr) external pure {
		require(_addr != address(0), errorMessage);
	}

	function validateGroup(address _addr, address _groupAddr) external view {
		require(IGroup(_groupAddr).isGroup(_addr), errorMessage);
	}

	function validateGroup(
		address _addr,
		address _groupAddr1,
		address _groupAddr2
	) external view {
		if (IGroup(_groupAddr1).isGroup(_addr)) {
			return;
		}
		require(IGroup(_groupAddr2).isGroup(_addr), errorMessage);
	}

	function validateAddress(address _addr, address _target) external pure {
		require(_addr == _target, errorMessage);
	}

	function validateAddress(address _addr, address _target1, address _target2)
		external
		pure
	{
		if (_addr == _target1) {
			return;
		}
		require(_addr == _target2, errorMessage);
	}
}
