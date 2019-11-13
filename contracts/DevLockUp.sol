pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./libs/Mapping.sol";
import "./libs/ERC20Transfer.sol";
import "./UseState.sol";
import "./policy/Policy.sol";

contract DevLockUp is UseState {
	using SafeMath for uint256;
	DevValue private devValue;
	CanceledLockUpFlg private canceledFlg;
	ReleasedBlockNumber private releasedBlockNumber;

	constructor() public {
		devValue = new DevValue();
		canceledFlg = new CanceledLockUpFlg();
		releasedBlockNumber = new ReleasedBlockNumber();
	}

	function lockUp(address propertyAddress, uint256 value) public {
		require(
			canceledFlg.isCanceled(propertyAddress) == false,
			"lock up is already canceled"
		);
		new ERC20Transfer(getToken()).transfer(propertyAddress, value);
		devValue.set(propertyAddress, value);
	}

	function cancel(address propertyAddress) public {
		require(
			devValue.hasTokenByProperty(propertyAddress),
			"dev token is not locked"
		);
		require(
			canceledFlg.isCanceled(propertyAddress) == false,
			"lock up is already canceled"
		);
		// TODO after withdrawal, allow the flag to be set again
		// TODO after withdrawal, update locked up value
		canceledFlg.setCancelFlg(propertyAddress);
		releasedBlockNumber.setBlockNumber(
			propertyAddress,
			Policy(policy()).lockUpBlocks()
		);
	}

	function getAllLockUpedValue() public view returns (uint256) {
		return devValue.getAllLockUpedValue();
	}
}

contract DevValue {
	using SafeMath for uint256;
	mapping(address => AddressValueMapping) private _lockUpedDevValue;
	address[] private _senderAddresses;

	function set(address propertyAddress, uint256 value) public {
		_lockUpedDevValue[msg.sender].add(propertyAddress, value);
		_senderAddresses.push(msg.sender);
	}

	function hasTokenByProperty(address propertyAddress)
		public
		view
		returns (bool)
	{
		return _lockUpedDevValue[msg.sender].get(propertyAddress) != 0;
	}

	function getAllLockUpedValue() public view returns (uint256) {
		uint256 arrayLength = _senderAddresses.length;
		uint256 totalValue;
		for (uint256 i = 0; i < arrayLength; i++) {
			totalValue = totalValue.add(
				_lockUpedDevValue[_senderAddresses[i]].getTotalValues()
			);
		}
		return totalValue;
	}
}

contract CanceledLockUpFlg {
	mapping(address => mapping(address => bool)) private _canceled;
	function setCancelFlg(address propertyAddress) public {
		_canceled[msg.sender][propertyAddress] = true;
	}
	function isCanceled(address propertyAddress) public view returns (bool) {
		return _canceled[msg.sender][propertyAddress];
	}
}

contract ReleasedBlockNumber {
	using SafeMath for uint256;
	mapping(address => mapping(address => uint256)) private _released;
	function setBlockNumber(address propertyAddress, uint256 wait) public {
		_released[msg.sender][propertyAddress] = block.number + wait;
	}
}
