pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "../common/config/UsingConfig.sol";
import "../common/validate/StringValidator.sol";
import "../common/validate/IntValidator.sol";
import "../allocator/Allocator.sol";
import "../lockup/Lockup.sol";

contract Property is ERC20, ERC20Detailed, UsingConfig {
	uint8 constant private _decimals = 18;
	uint256 constant private _supply = 10000000;
	address public author;
	StringValidator sValidator = new StringValidator();
	AddressValidator aValidator = new AddressValidator();
	IntValidator iValidator = new IntValidator();

	constructor(
		address _config,
		address _own,
		string memory _name,
		string memory _symbol
	) public UsingConfig(_config) ERC20Detailed(_name, _symbol, _decimals) {
		sValidator.validateEmpty(_name);
		sValidator.validateEmpty(_symbol);
		aValidator.validateDefault(_config);
		aValidator.validateDefault(_own);
		aValidator.validateSender(msg.sender, config().propertyFactory());

		author = _own;
		_mint(author, _supply);
	}

	function transfer(address _to, uint256 _value) public returns (bool) {
		aValidator.validateDefault(_to);
		iValidator.validateEmpty(_value);

		Allocator(config().allocator()).beforeBalanceChange(
			address(this),
			msg.sender,
			_to
		);
		_transfer(msg.sender, _to, _value);
		return true;
	}

	function withdrawDev(address _sender) external {
		aValidator.validateDefault(_sender);
		aValidator.validateSender(msg.sender, config().lockup());

		uint256 value = LockupValue(config().lockupValue()).get(
			address(this),
			_sender
		);
		require(value != 0, "your token is 0");
		ERC20 devToken = ERC20(config().token());
		devToken.transfer(_sender, value);
	}
}
