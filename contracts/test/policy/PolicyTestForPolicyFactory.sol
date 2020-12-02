pragma solidity 0.5.17;

import {PolicyTestBase} from "contracts/test/policy/PolicyTestBase.sol";

contract PolicyTestForPolicyFactory is PolicyTestBase {
	function policyVotingBlocks() external view returns (uint256) {
		return 10;
	}
}
