pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./UseState.sol";

contract DevLockUp is UseState{
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
		ERC20 devToken = ERC20(getToken());
		uint256 balance = devToken.balanceOf(msg.sender);
		require(
			value <= balance,
			"insufficient balance"
		);
		devToken.transfer(propertyAddress, value);
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
		canceledFlg.setCancelFlg(propertyAddress);
		// TODO get wait block number from polisy contract
		releasedBlockNumber.setBlockNumber(propertyAddress, 10);
	}
}

contract DevValue {
	using SafeMath for uint256;
	mapping(address => mapping(address => uint256)) private _lockUpedDevValue;
	function set(address propertyAddress, uint256 value) public {
		_lockUpedDevValue[msg.sender][propertyAddress] = _lockUpedDevValue[msg.sender][propertyAddress] + value;
	}

	function hasTokenByProperty(address propertyAddress) public view returns (bool){
		return _lockUpedDevValue[msg.sender][propertyAddress] != 0;
	}
}

contract CanceledLockUpFlg {
	mapping(address => mapping(address => bool)) private _canceled;
	function setCancelFlg(address propertyAddress) public {
		_canceled[msg.sender][propertyAddress] = true;
	}
	function isCanceled(address propertyAddress) public view returns (bool){
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
