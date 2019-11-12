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

	function lockUp(address propatyAddress, uint256 value) public {
		require(
			canceledFlg.isCanceled(propatyAddress) == false,
			"lock up is already canceled"
		);
		ERC20 devToken = ERC20(getToken());
		uint256 balance = devToken.balanceOf(msg.sender);
		require(
			value <= balance,
			"insufficient balance"
		);
		devToken.transfer(propatyAddress, value);
		devValue.set(propatyAddress, value);
	}

	function cancel(address propatyAddress) public {
		require(
			devValue.hasTokenByPropaty(propatyAddress),
			"dev token is not locked"
		);
		require(
			canceledFlg.isCanceled(propatyAddress) == false,
			"lock up is already canceled"
		);
		// TODO after withdrawal, allow the flag to be set again
		canceledFlg.setCancelFlg(propatyAddress);
		// TODO get wait block number from polisy contract
		releasedBlockNumber.setBlockNumber(propatyAddress, 10);
	}
}

contract DevValue {
	using SafeMath for uint256;
	mapping(address => mapping(address => uint256)) private _lockUpedDevValue;
	function set(address propatyAddress, uint256 value) public {
		_lockUpedDevValue[msg.sender][propatyAddress] = _lockUpedDevValue[msg.sender][propatyAddress] + value;
	}

	function hasTokenByPropaty(address propatyAddress) public view returns (bool){
		return _lockUpedDevValue[msg.sender][propatyAddress] != 0;
	}
}

contract CanceledLockUpFlg {
	mapping(address => mapping(address => bool)) private _canceled;
	function setCancelFlg(address propatyAddress) public {
		_canceled[msg.sender][propatyAddress] = true;
	}
	function isCanceled(address propatyAddress) public view returns (bool){
		return _canceled[msg.sender][propatyAddress];
	}
}

contract ReleasedBlockNumber {
	using SafeMath for uint256;
	mapping(address => mapping(address => uint256)) private _released;
	function setBlockNumber(address propatyAddress, uint256 wait) public {
		_released[msg.sender][propatyAddress] = block.number + wait;
	}
}
