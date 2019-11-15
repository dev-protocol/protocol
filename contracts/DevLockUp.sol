pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./UseState.sol";

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

	function lockUp(address propertyAddress, uint256 value)
		public
	{
		require(
			canceledFlg.isCanceled(msg.sender, propertyAddress) == false,
			"lock up is already canceled"
		);
		ERC20 devToken = ERC20(getToken());
		uint256 balance = devToken.balanceOf(msg.sender);
		require(value <= balance, "insufficient balance");
		// solium-disable-next-line security/no-low-level-calls
		(bool success, bytes memory data) = address(devToken).delegatecall(
			abi.encodeWithSignature(
				"transfer(address,uint256)",
				propertyAddress,
				value
			)
		);
		require(success, "transfer was failed.");
		require(abi.decode(data, (bool)), "transfer was failed.");
		devValue.set(msg.sender, propertyAddress, value);
	}

	function cancel(address propertyAddress) public {
		require(
			devValue.hasTokenByProperty(msg.sender, propertyAddress),
			"dev token is not locked"
		);
		require(
			canceledFlg.isCanceled(msg.sender, propertyAddress) == false,
			"lock up is already canceled"
		);
		// TODO after withdrawal, allow the flag to be set again
		canceledFlg.setCancelFlg(msg.sender, propertyAddress);
		// TODO get wait block number from polisy contract
		releasedBlockNumber.setBlockNumber(msg.sender, propertyAddress, 10);
	}
}

contract DevValue {
	using SafeMath for uint256;
	mapping(address => mapping(address => uint256)) private _lockUpedDevValue;
	function set(address fromAddress, address propertyAddress, uint256 value)
		public
	{
		_lockUpedDevValue[fromAddress][propertyAddress] =
			_lockUpedDevValue[fromAddress][propertyAddress] +
			value;
	}

	function hasTokenByProperty(address fromAddress, address propertyAddress)
		public
		view
		returns (bool)
	{
		return _lockUpedDevValue[fromAddress][propertyAddress] != 0;
	}
}

contract CanceledLockUpFlg {
	mapping(address => mapping(address => bool)) private _canceled;
	function setCancelFlg(address fromAddress, address propertyAddress) public {
		_canceled[fromAddress][propertyAddress] = true;
	}
	function isCanceled(address fromAddress, address propertyAddress)
		public
		view
		returns (bool)
	{
		return _canceled[fromAddress][propertyAddress];
	}
}

contract ReleasedBlockNumber {
	using SafeMath for uint256;
	mapping(address => mapping(address => uint256)) private _released;
	function setBlockNumber(
		address fromAddress,
		address propertyAddress,
		uint256 wait
	) public {
		_released[fromAddress][propertyAddress] = block.number + wait;
	}
}
