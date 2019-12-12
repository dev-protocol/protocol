pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../common/config/UsingConfig.sol";
import "../common/validate/AddressValidator.sol";
import "../property/PropertyGroup.sol";
import "./WithdrawStorage.sol";

contract Withdraw is UsingConfig {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config)
		public
		UsingConfig(_config)
	{}

	function withdraw(address _property) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().allocator()
		);

		uint256 _value = calculateWithdrawableAmount(_property, msg.sender);
		uint256 value = _value +
			getStorage().getPendingWithdrawal(_property, msg.sender);
		require(value != 0, "withdraw value is 0");
		uint256 price = getStorage().getCumulativePrice(_property);
		getStorage().setLastWithdrawalPrice(_property, msg.sender, price);
		getStorage().setPendingWithdrawal(_property, msg.sender, 0);
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

		uint256 price = getStorage().getCumulativePrice(_property);
		getStorage().setLastWithdrawalPrice(_property, _from, price);
		getStorage().setLastWithdrawalPrice(_property, _to, price);
		uint256 amount = calculateWithdrawableAmount(_property, _from);
		uint256 tmp = getStorage().getPendingWithdrawal(_property, _from);
		getStorage().setPendingWithdrawal(_property, _from, tmp + amount);
		uint256 totalLimit = getStorage().getWithdrawalLimitTotal(
			_property,
			_to
		);
		uint256 total = getStorage().getRewardsAmount(_property);
		if (totalLimit != total) {
			getStorage().setWithdrawalLimit(
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

		getStorage().increment(_property, _allocationResult);
	}

	function getRewardsAmount(address _property)
		external
		view
		returns (uint256)
	{
		return getStorage().getRewardsAmount(_property);
	}

	function calculateWithdrawableAmount(address _property, address _user)
		private
		view
		returns (uint256)
	{
		uint256 _last = getStorage().getLastWithdrawalPrice(
			_property,
			_user
		);
		(uint256 totalLimit, uint256 balanceLimit) = getStorage()
			.getWithdrawalLimit(_property, _user);
		uint256 price = getStorage().getCumulativePrice(_property);
		uint256 priceGap = price - _last;
		uint256 balance = ERC20(_property).balanceOf(_user);
		uint256 total = getStorage().getRewardsAmount(_property);
		if (totalLimit == total) {
			balance = balanceLimit;
		}
		uint256 value = priceGap * balance;
		return value;
	}

	function getStorage() private view returns (WithdrawStorage) {
		return WithdrawStorage(config().withdrawStorage());
	}
}
