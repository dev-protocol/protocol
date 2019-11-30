pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./libs/Utils.sol";
import "./policy/PolicyFactory.sol";
import "./property/Property.sol";
import "./property/PropertyGroup.sol";
import "./common/config/UsingConfig.sol";

contract Lockup is UsingConfig {
	using SafeMath for uint256;
	TokenValue private _tokenValue;
	CanceledLockupFlg private _canceledFlg;
	ReleasedBlockNumber private _releasedBlockNumber;

	constructor(address _config) public UsingConfig(_config) {
		_tokenValue = new TokenValue();
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
		_tokenValue.set(_property, msg.sender, _value);
	}

	function cancel(address _property) public {
		require(
			PropertyGroup(config().propertyGroup()).isProperty(_property),
			"this address is not property contract"
		);
		require(
			_tokenValue.hasTokenByProperty(_property, msg.sender),
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
		uint256 lockupedValue = _tokenValue.get(_property, msg.sender);
		require(lockupedValue == 0, "dev token is not locked");
		Property(_property).withdrawDev(msg.sender);
		_canceledFlg.setCancelFlg(_property, msg.sender, false);
		_tokenValue.set(_property, msg.sender, 0);
		_releasedBlockNumber.clear(_property, msg.sender);
	}

	function getTokenValue(address _property, address _from)
		public
		view
		returns (uint256)
	{
		return _tokenValue.get(_property, _from);
	}

	function getTokenValueByProperty(address _property)
		public
		view
		returns (uint256)
	{
		return _tokenValue.getByProperty(_property);
	}
}

contract TokenValue {
	mapping(address => AddressUintMap) private _lockupedTokenValue;
	mapping(address => bool) private _hasPropertyAddress;
	function set(address _property, address _from, uint256 _value) public {
		if (_hasPropertyAddress[_property] == false) {
			_lockupedTokenValue[_property] = new AddressUintMap();
			_hasPropertyAddress[_property] = true;
		}
		_lockupedTokenValue[_property].add(_from, _value);
	}

	function hasTokenByProperty(address _property, address _from)
		public
		view
		returns (bool)
	{
		if (_hasPropertyAddress[_property] == false) {
			return false;
		}
		return _lockupedTokenValue[_property].get(_from) != 0;
	}

	function get(address _property, address _from)
		public
		view
		returns (uint256)
	{
		if (_hasPropertyAddress[_property] == false) {
			return 0;
		}
		return _lockupedTokenValue[_property].get(_from);
	}

	function getByProperty(address _property) public view returns (uint256) {
		if (_hasPropertyAddress[_property] == false) {
			return 0;
		}
		return _lockupedTokenValue[_property].getSumAllValue();
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
