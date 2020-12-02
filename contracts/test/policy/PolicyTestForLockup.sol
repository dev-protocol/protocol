pragma solidity 0.5.17;

import {IPolicy} from "contracts/interface/IPolicy.sol";

contract PolicyTestForLockup is IPolicy {
	uint256 private _lockUpBlocks = 1;

	// solhint-disable-next-line no-unused-vars
	function rewards(uint256 _lockups, uint256 _assets)
		external
		view
		returns (uint256)
	{
		return 100000000000000000000;
	}

	function holdersShare(uint256 _amount, uint256 _lockups)
		external
		view
		returns (uint256)
	{
		return _lockups > 0 ? (_amount * 90) / 100 : _amount;
	}

	function authenticationFee(uint256 _assets, uint256 _propertyLockups)
		external
		view
		returns (uint256)
	{
		return _assets + _propertyLockups + 1;
	}

	function marketVotingBlocks() external view returns (uint256) {
		return 10;
	}

	function policyVotingBlocks() external view returns (uint256) {
		return 20;
	}
}
