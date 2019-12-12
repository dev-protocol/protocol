pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../common/config/UsingConfig.sol";
import "../common/validate/AddressValidator.sol";
import "../property/PropertyGroup.sol";
import "./storage/UsingWithdrawStorage.sol";

contract Withdraw is UsingConfig, UsingWithdrawStorage {

	// solium-disable-next-line no-empty-blocks
	constructor(address _config, address _withdrawConfig) public UsingConfig(_config) UsingWithdrawStorage(_withdrawConfig){}

	function withdraw(address _property) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);

		uint256 _value = calculateWithdrawableAmount(_property, msg.sender);
		uint256 value = _value + pendingWithdrawal().get(_property, msg.sender);
		require(value != 0, "withdraw value is 0");
		uint256 price = allocation().getCumulativePrice(
			_property
		);
		lastWithdrawalPrice().set(_property, msg.sender, price);
		pendingWithdrawal().set(_property, msg.sender, 0);
		ERC20Mintable erc20 = ERC20Mintable(config().token());
		erc20.mint(msg.sender, value);
	}

	function beforeBalanceChange(address _property, address _from, address _to)
		external
	{
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);

		uint256 price = allocation().getCumulativePrice(
			_property
		);
		lastWithdrawalPrice().set(_property, _from, price);
		lastWithdrawalPrice().set(_property, _to, price);
		uint256 amount = calculateWithdrawableAmount(_property, _from);
		uint256 tmp = pendingWithdrawal().get(_property, _from);
		pendingWithdrawal().set(_property, _from, tmp + amount);
		uint256 totalLimit = withdrawalLimit().getTotal(_property, _to);
		uint256 total = allocation().getRewardsAmount(
			_property
		);
		if (totalLimit != total) {
			withdrawalLimit().set(_property, _to, total, ERC20(_property).balanceOf(_to));
		}
	}

	function increment(address _property, uint256 _allocationResult) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);

		allocation().increment(
			_property,
			_allocationResult
		);
	}

	function getRewardsAmount(address _property)
		external
		view
		returns (uint256)
	{
		return allocation().getRewardsAmount(_property);
	}

	function calculateWithdrawableAmount(address _property, address _user)
		private
		view
		returns (uint256)
	{
		uint256 _last = lastWithdrawalPrice().get(_property, _user);
		(uint256 totalLimit, uint256 balanceLimit) = withdrawalLimit().get(_property, _user);
		uint256 price = allocation().getCumulativePrice(
			_property
		);
		uint256 priceGap = price - _last;
		uint256 balance = ERC20(_property).balanceOf(_user);
		uint256 total = allocation().getRewardsAmount(
			_property
		);
		if (totalLimit == total) {
			balance = balanceLimit;
		}
		uint256 value = priceGap * balance;
		return value;
	}
}
