pragma solidity ^0.6.0;

abstract contract ContractGroup {
	function isGroup(address _addr) public virtual view returns (bool);

	function addGroup(address _addr) external virtual;

	function getGroupKey(address _addr) internal pure returns (bytes32) {
		return keccak256(abi.encodePacked("_group", _addr));
	}
}
