pragma solidity ^0.5.0;

import {SafeMath} from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import {Killable} from "contracts/src/common/lifecycle/Killable.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {UsingStorage} from "contracts/src/common/storage/UsingStorage.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {IGroup} from "contracts/src/common/interface/IGroup.sol";


contract MarketGroup is
	UsingConfig,
	UsingStorage,
	IGroup,
	UsingValidator,
	Killable
{
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) UsingStorage() {}

	function addGroup(address _addr) external {
		addressValidator().validateAddress(
			msg.sender,
			config().marketFactory()
		);

		require(isGroup(_addr) == false, "already enabled");
		eternalStorage().setBool(getGroupKey(_addr), true);
		addCount();
	}

	function isGroup(address _addr) public view returns (bool) {
		return eternalStorage().getBool(getGroupKey(_addr));
	}

	function addCount() private {
		bytes32 key = getCountKey();
		uint256 number = eternalStorage().getUint(key);
		number = number.add(1);
		eternalStorage().setUint(key, number);
	}

	function getCount() external view returns (uint256) {
		bytes32 key = getCountKey();
		return eternalStorage().getUint(key);
	}

	function getCountKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_count"));
	}
}
