pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../common/config/UsingConfig.sol";
import "./Allocation.sol";
import "../property/PropertyGroup.sol";
import "./LastWithdrawalPrice.sol";

contract Withdrawable is UsingConfig {
	struct WithdrawalLimit {
		uint256 total;
		uint256 balance;
	}

	mapping(address => mapping(address => uint256)) private pendingWithdrawals;
	mapping(address => mapping(address => WithdrawalLimit)) private withdrawalLimits;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function withdraw(address _property) public payable {
		require(
			PropertyGroup(config().propertyGroup()).isProperty(_property),
			"only property contract"
		);
		uint256 _value = calculateWithdrawableAmount(_property, msg.sender);
		uint256 value = _value + pendingWithdrawals[_property][msg.sender];
		require(value != 0, "withdraw value is 0");
		uint256 price = Allocation(config().allocation()).getCumulativePrice(
			_property
		);
		LastWithdrawalPrice lastPrice = LastWithdrawalPrice(config().lastWithdrawalPrice());
		lastPrice.set(_property, msg.sender, price);
		pendingWithdrawals[_property][msg.sender] = 0;
		ERC20Mintable erc20 = ERC20Mintable(config().token());
		erc20.mint(msg.sender, value);
	}

	function beforeBalanceChange(address _property, address _from, address _to)
		public
	{
		uint256 price = Allocation(config().allocation()).getCumulativePrice(
			_property
		);
		LastWithdrawalPrice lastPrice = LastWithdrawalPrice(config().lastWithdrawalPrice());
		lastPrice.set(_property, _from, price);
		lastPrice.set(_property, _to, price);
		pendingWithdrawals[_property][_from] += calculateWithdrawableAmount(
			_property,
			_from
		);
		WithdrawalLimit memory _limit = withdrawalLimits[_property][_to];
		uint256 total = Allocation(config().allocation()).getRewardsAmount(
			_property
		);
		if (_limit.total != total) {
			withdrawalLimits[_property][_to] = WithdrawalLimit(
				total,
				ERC20(_property).balanceOf(_to)
			);
		}
	}

	function calculateWithdrawableAmount(address _property, address _user)
		private
		view
		returns (uint256)
	{
		LastWithdrawalPrice lastPrice = LastWithdrawalPrice(config().lastWithdrawalPrice());

		uint256 _last = lastPrice.get(_property, _user);
		WithdrawalLimit memory _limit = withdrawalLimits[_property][_user];
		uint256 price = Allocation(config().allocation()).getCumulativePrice(
			_property
		);
		uint256 priceGap = price - _last;
		uint256 balance = ERC20(_property).balanceOf(_user);
		uint256 total = Allocation(config().allocation()).getRewardsAmount(
			_property
		);
		if (_limit.total == total) {
			balance = _limit.balance;
		}
		uint256 value = priceGap * balance;
		return value;
	}
}
