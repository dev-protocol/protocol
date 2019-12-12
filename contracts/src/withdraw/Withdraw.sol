pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../common/config/UsingConfig.sol";
import "../common/validate/AddressValidator.sol";
import "../property/PropertyGroup.sol";
import "./storage/UsingWithdrawStorage.sol";

contract Withdraw is UsingConfig, UsingWithdrawStorage {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config, address _withdrawConfig)
		public
		UsingConfig(_config)
		UsingWithdrawStorage(_withdrawConfig)
	{}

	function withdraw(address _property) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);

		uint256 _value = calculateWithdrawableAmount(_property, msg.sender);
		uint256 value = _value +
			withdrawStorage().getPendingWithdrawal(_property, msg.sender);
		require(value != 0, "withdraw value is 0");
		uint256 price = withdrawStorage().getCumulativePrice(_property);
		withdrawStorage().setLastWithdrawalPrice(_property, msg.sender, price);
		withdrawStorage().setPendingWithdrawal(_property, msg.sender, 0);
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

		uint256 price = withdrawStorage().getCumulativePrice(_property);
		withdrawStorage().setLastWithdrawalPrice(_property, _from, price);
		withdrawStorage().setLastWithdrawalPrice(_property, _to, price);
		uint256 amount = calculateWithdrawableAmount(_property, _from);
		uint256 tmp = withdrawStorage().getPendingWithdrawal(_property, _from);
		withdrawStorage().setPendingWithdrawal(_property, _from, tmp + amount);
		uint256 totalLimit = withdrawStorage().getWithdrawalLimitTotal(
			_property,
			_to
		);
		uint256 total = withdrawStorage().getRewardsAmount(_property);
		if (totalLimit != total) {
			withdrawStorage().setWithdrawalLimit(
				_property,
				_to,
				total,
				ERC20(_property).balanceOf(_to)
			);
		}
	}

	function increment(address _property, uint256 _allocationResult) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);

		withdrawStorage().increment(_property, _allocationResult);
	}

	function getRewardsAmount(address _property)
		external
		view
		returns (uint256)
	{
		return withdrawStorage().getRewardsAmount(_property);
	}

	function calculateWithdrawableAmount(address _property, address _user)
		private
		view
		returns (uint256)
	{
		uint256 _last = withdrawStorage().getLastWithdrawalPrice(
			_property,
			_user
		);
		(uint256 totalLimit, uint256 balanceLimit) = withdrawStorage()
			.getWithdrawalLimit(_property, _user);
		uint256 price = withdrawStorage().getCumulativePrice(_property);
		uint256 priceGap = price - _last;
		uint256 balance = ERC20(_property).balanceOf(_user);
		uint256 total = withdrawStorage().getRewardsAmount(_property);
		if (totalLimit == total) {
			balance = balanceLimit;
		}
		uint256 value = priceGap * balance;
		return value;
	}
}
