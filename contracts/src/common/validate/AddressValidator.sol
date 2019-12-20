pragma solidity ^0.5.0;

import {IGroup} from "contracts/src/common/interface/IGroup.sol";
import {Strings} from "contracts/src/common/libs/Strings.sol";

contract AddressValidator {
	using Strings for *;

	function validateDefault(address _addr) external pure {
		require(_addr != address(0), "address is initial value");
	}

	function validateGroup(address _addr, address _groupAddr) external view {
		IGroup group = IGroup(_groupAddr);
		string memory s1 = "this address is not ";
		string memory s2 = " group";
		string memory message = s1.toSlice().concat(group.name().toSlice());
		message = message.toSlice().concat(s2.toSlice());
		require(group.isGroup(_addr), message);
	}

	function validateGroup(
		address _addr,
		address _groupAddr1,
		address _groupAddr2
	) external view {
		IGroup group = IGroup(_groupAddr1);
		if (group.isGroup(_addr)) {
			return;
		}
		IGroup group2 = IGroup(_groupAddr2);
		if (group2.isGroup(_addr)) {
			return;
		}
		string memory message = "this address is not ";
		string memory s2 = " and ";
		string memory s3 = " group";
		message = message.toSlice().concat(group.name().toSlice());
		message = message.toSlice().concat(s2.toSlice());
		message = message.toSlice().concat(group2.name().toSlice());
		message = message.toSlice().concat(s3.toSlice());
		revert(message);
	}

	function validateAddress(address _addr, address _target) external pure {
		if (_addr == _target) {
			return;
		}
		string memory addr = toString(_addr);
		string memory target = toString(_target);
		string memory message = "wrong address address:";
		string memory s1 = " target:";
		message = message.toSlice().concat(addr.toSlice());
		message = message.toSlice().concat(s1.toSlice());
		message = message.toSlice().concat(target.toSlice());
		revert(message);
	}

	function validateAddress(address _addr, address _target1, address _target2)
		external
		pure
	{
		if (_addr == _target1) {
			return;
		}
		if (_addr == _target2) {
			return;
		}
		string memory addr = toString(_addr);
		string memory target1 = toString(_target1);
		string memory target2 = toString(_target2);
		string memory message = "wrong address address:";
		string memory s1 = " target:";
		string memory s2 = ",";
		message = message.toSlice().concat(addr.toSlice());
		message = message.toSlice().concat(s1.toSlice());
		message = message.toSlice().concat(target1.toSlice());
		message = message.toSlice().concat(s2.toSlice());
		message = message.toSlice().concat(target2.toSlice());
		revert(message);
	}

	function toString(address x) private pure returns (string memory) {
		bytes memory b = new bytes(20);
		for (uint256 i = 0; i < 20; i++)
			b[i] = bytes1(uint8(uint256(x) / (2 ** (8 * (19 - i)))));
		return string(b);
	}
}
