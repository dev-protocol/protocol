pragma solidity ^0.5.0;

import {IGroup} from "contracts/src/common/interface/IGroup.sol";

contract IMarketGroup is IGroup {
	function getCount() external view returns (uint256);
}
