pragma solidity 0.5.17;

import {PolicyTestBase} from "contracts/test/policy/PolicyTestBase.sol";

contract PolicyTestForVoteCounter is PolicyTestBase {
	function marketVotingBlocks() external view returns (uint256) {
		return 15;
	}

	function policyVotingBlocks() external view returns (uint256) {
		return 15;
	}
}
