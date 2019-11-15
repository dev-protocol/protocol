pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./libs/Utils.sol";
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

	function lockUp(address fromAddress, address propertyAddress, uint256 value)
		public
	{
		require(
			canceledFlg.isCanceled(fromAddress, propertyAddress) == false,
			"lock up is already canceled"
		);
		ERC20 devToken = ERC20(getToken());
		uint256 balance = devToken.balanceOf(fromAddress);
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
		devValue.set(fromAddress, propertyAddress, value);
	}

	function cancel(address fromAddress, address propertyAddress) public {
		require(
			devValue.hasTokenByProperty(fromAddress, propertyAddress),
			"dev token is not locked"
		);
		require(
			canceledFlg.isCanceled(fromAddress, propertyAddress) == false,
			"lock up is already canceled"
		);
		// TODO after withdrawal, allow the flag to be set again
		// TODO after withdrawal, update locked up value
		canceledFlg.setCancelFlg(fromAddress, propertyAddress);
		releasedBlockNumber.setBlockNumber(
			fromAddress,
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
	AddressSet private _senderAddresses;

	constructor() public {
		_senderAddresses = new AddressSet();
	}

	function set(address fromAddress, address propertyAddress, uint256 value)
		public
	{
		if (_senderAddresses.hasAddress(fromAddress) == false){
			_lockUpedDevValue[fromAddress] = new AddressValueMapping();
		}
		_lockUpedDevValue[fromAddress].add(propertyAddress, value);
	}

	function hasTokenByProperty(address fromAddress, address propertyAddress)
		public
		view
		returns (bool)
	{
		return _lockUpedDevValue[fromAddress].get(propertyAddress) != 0;
	}

	function getAllLockUpedValue() public view returns (uint256) {
		uint256 totalValue;
		for (uint256 i = 0; i < _senderAddresses.length(); i++) {
			totalValue = totalValue.add(
				_lockUpedDevValue[_senderAddresses.get()[i]].getTotalValues()
			);
		}
		return totalValue;
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
