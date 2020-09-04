pragma solidity ^0.5.0;

import {IGroup} from "contracts/src/common/interface/IGroup.sol";

contract IPolicyGroup is IGroup {
	function getVotingGroupIndex() external view returns (uint256);

	function incrementVotingGroupIndex() external;
}
