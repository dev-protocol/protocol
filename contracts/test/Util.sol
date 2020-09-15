pragma solidity 0.5.17;

contract Util {
	function blockNumber() public view returns (uint256) {
		return block.number;
	}

	function createKey(string memory _key) public pure returns (bytes32) {
		return keccak256(abi.encodePacked(_key));
	}
}
