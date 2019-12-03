pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./libs/Utils.sol";
import "./policy/PolicyFactory.sol";
import "./property/Property.sol";
import "./property/PropertyGroup.sol";
import "./common/config/UsingConfig.sol";
import "./common/storage/UsingStorage.sol";
import "./LockupValue.sol";
import "./LockupPropertyValue.sol";

contract Lockup is UsingConfig, UsingStorage {
	using SafeMath for uint256;
	CanceledLockupFlg private _canceledFlg;
	ReleasedBlockNumber private _releasedBlockNumber;

	constructor(address _config) public UsingConfig(_config) {
		_canceledFlg = new CanceledLockupFlg();
		_releasedBlockNumber = new ReleasedBlockNumber();
	}

	function lockup(address _property, uint256 _value) public {
		require(
			PropertyGroup(config().propertyGroup()).isProperty(_property),
			"this address is not property contract"
		);
		require(
			_canceledFlg.isCanceled(_property, msg.sender) == false,
			"lockup is already canceled"
		);
		ERC20 devToken = ERC20(config().token());
		uint256 balance = devToken.balanceOf(msg.sender);
		require(_value <= balance, "insufficient balance");
		// solium-disable-next-line security/no-low-level-calls
		(bool success, bytes memory data) = address(devToken).delegatecall(
			abi.encodeWithSignature(
				"transfer(address,uint256)",
				_property,
				_value
			)
		);
		require(success, "transfer was failed");
		require(abi.decode(data, (bool)), "transfer was failed");
		LockupValue(config().lockupValue()).add(_property, msg.sender, _value);
		LockupPropertyValue(config().lockupPropertyValue()).add(_property, _value);
	}

	function cancel(address _property) public {
		require(
			PropertyGroup(config().propertyGroup()).isProperty(_property),
			"this address is not property contract"
		);
		require(
			LockupValue(config().lockupValue()).hasValue(_property, msg.sender),
			"dev token is not locked"
		);
		require(
			_canceledFlg.isCanceled(_property, msg.sender) == false,
			"lockup is already canceled"
		);
		_canceledFlg.setCancelFlg(_property, msg.sender, true);
		_releasedBlockNumber.setBlockNumber(
			_property,
			msg.sender,
			Policy(config().policy()).lockUpBlocks()
		);
	}

	function withdraw(address _property) public {
		require(
			PropertyGroup(config().propertyGroup()).isProperty(_property),
			"this address is not property contract"
		);
		require(
			_canceledFlg.isCanceled(_property, msg.sender),
			"lockup is not canceled"
		);
		require(
			_releasedBlockNumber.canRlease(_property, msg.sender),
			"waiting for release"
		);
		uint256 lockupedValue = LockupValue(config().lockupValue()).get(_property, msg.sender);
		require(lockupedValue == 0, "dev token is not locked");
		Property(_property).withdrawDev(msg.sender);
		_canceledFlg.setCancelFlg(_property, msg.sender, false);
		LockupValue(config().lockupValue()).clear(_property, msg.sender);
		LockupPropertyValue(config().lockupPropertyValue()).sub(_property, lockupedValue);
		_releasedBlockNumber.clear(_property, msg.sender);
	}
}

contract CanceledLockupFlg {
	mapping(address => mapping(address => bool)) private _canceled;
	function setCancelFlg(address _property, address _from, bool setValue)
		public
	{
		_canceled[_property][_from] = setValue;
	}
	function isCanceled(address _property, address _from)
		public
		view
		returns (bool)
	{
		return _canceled[_property][_from];
	}
}

contract ReleasedBlockNumber {
	using SafeMath for uint256;
	mapping(address => mapping(address => uint256)) private _released;
	function setBlockNumber(address _property, address _from, uint256 _wait)
		public
	{
		_released[_property][_from] = block.number.add(_wait);
	}
	function canRlease(address _property, address _from)
		public
		view
		returns (bool)
	{
		if (_released[_property][_from] == 0) {
			return false;
		}
		return _released[_property][_from] <= block.number;
	}
	function clear(address _property, address _from) public {
		_released[_property][_from] = 0;
	}
}
