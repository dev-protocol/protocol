pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./libs/Utils.sol";
import "./policy/PolicyFactory.sol";
import "./property/PropertyGroup.sol";
import "./config/UsingConfig.sol";

contract Lockup is UsingConfig {
	using SafeMath for uint256;
	TokenValue private _tokenValue;
	CanceledLockupFlg private _canceledFlg;
	ReleasedBlockNumber private _releasedBlockNumber;

	constructor(address addressConfig) public UsingConfig(addressConfig) {
		_tokenValue = new TokenValue();
		_canceledFlg = new CanceledLockupFlg();
		_releasedBlockNumber = new ReleasedBlockNumber();
	}

	function lockup(address _propertyAddress, uint256 _value) public {
		require(
			PropertyGroup(config().propertyGroup()).isProperty(
				_propertyAddress
			),
			"this address is not property contract."
		);
		require(
			_canceledFlg.isCanceled(msg.sender, _propertyAddress) == false,
			"lock up is already canceled"
		);
		ERC20 devToken = ERC20(config().token());
		uint256 balance = devToken.balanceOf(msg.sender);
		require(_value <= balance, "insufficient balance");
		// solium-disable-next-line security/no-low-level-calls
		(bool success, bytes memory data) = address(devToken).delegatecall(
			abi.encodeWithSignature(
				"transfer(address,uint256)",
				_propertyAddress,
				_value
			)
		);
		require(success, "transfer was failed.");
		require(abi.decode(data, (bool)), "transfer was failed.");
		_tokenValue.set(msg.sender, _propertyAddress, _value);
	}

	function cancel(address _propertyAddress) public {
		require(
			PropertyGroup(config().propertyGroup()).isProperty(
				_propertyAddress
			),
			"this address is not property contract."
		);
		require(
			_tokenValue.hasTokenByProperty(msg.sender, _propertyAddress),
			"dev token is not locked"
		);
		require(
			_canceledFlg.isCanceled(msg.sender, _propertyAddress) == false,
			"lock up is already canceled"
		);
		// TODO after withdrawal, allow the flag to be set again
		// TODO after withdrawal, update locked up value
		_canceledFlg.setCancelFlg(msg.sender, _propertyAddress);
		_releasedBlockNumber.setBlockNumber(
			msg.sender,
			_propertyAddress,
			Policy(config().policy()).lockUpBlocks()
		);
	}

	function getTokenValue(address _fromAddress, address _propertyAddress)
		public
		view
		returns (uint256)
	{
		return _tokenValue.get(_fromAddress, _propertyAddress);
	}
}

contract TokenValue {
	using SafeMath for uint256;
	mapping(address => mapping(address => uint256)) private _lockupedTokenValue;
	function set(address _fromAddress, address _propertyAddress, uint256 _value)
		public
	{
		_lockupedTokenValue[_fromAddress][_propertyAddress] += _value;
	}

	function hasTokenByProperty(address _fromAddress, address _propertyAddress)
		public
		view
		returns (bool)
	{
		return _lockupedTokenValue[_fromAddress][_propertyAddress] != 0;
	}

	function get(address _fromAddress, address _propertyAddress)
		public
		view
		returns (uint256)
	{
		return _lockupedTokenValue[_fromAddress][_propertyAddress];
	}
}

contract CanceledLockupFlg {
	mapping(address => mapping(address => bool)) private _canceled;
	function setCancelFlg(address _fromAddress, address _propertyAddress)
		public
	{
		_canceled[_fromAddress][_propertyAddress] = true;
	}
	function isCanceled(address _fromAddress, address _propertyAddress)
		public
		view
		returns (bool)
	{
		return _canceled[_fromAddress][_propertyAddress];
	}
}

contract ReleasedBlockNumber {
	using SafeMath for uint256;
	mapping(address => mapping(address => uint256)) private _released;
	function setBlockNumber(
		address _fromAddress,
		address _propertyAddress,
		uint256 _wait
	) public {
		_released[_fromAddress][_propertyAddress] = block.number + _wait;
	}
}
