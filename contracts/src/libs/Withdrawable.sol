pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/config/UsingConfig.sol";
import "../common/modifier/UsingModifier.sol";
import "../property/PropertyGroup.sol";

contract Withdrawable is UsingConfig {
	using SafeMath for uint256;
	struct WithdrawalLimit {
		uint256 total;
		uint256 balance;
	}

	mapping(address => uint256) totals;
	mapping(address => uint256) prices;
	mapping(address => mapping(address => uint256)) internal lastWithdrawalPrices;
	mapping(address => mapping(address => uint256)) internal pendingWithdrawals;
	mapping(address => mapping(address => WithdrawalLimit)) internal withdrawalLimits;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function getRewardsAmount(address _property) public view returns (uint256) {
		return totals[_property];
	}

	function withdraw(address _property) public payable {
		require(
			PropertyGroup(config().propertyGroup()).isProperty(_property),
			"only property contract"
		);
		uint256 _value = calculateWithdrawableAmount(_property, msg.sender);
		uint256 value = _value + pendingWithdrawals[_property][msg.sender];
		require(value != 0, "withdraw value is 0");
		lastWithdrawalPrices[_property][msg.sender] = prices[_property];
		pendingWithdrawals[_property][msg.sender] = 0;
		ERC20Mintable erc20 = ERC20Mintable(config().token());
		erc20.mint(msg.sender, value);
	}

	function beforeBalanceChange(address _property, address _from, address _to)
		public
	{
		lastWithdrawalPrices[_property][_from] = prices[_property];
		lastWithdrawalPrices[_property][_to] = prices[_property];
		pendingWithdrawals[_property][_from] += calculateWithdrawableAmount(
			_property,
			_from
		);
		WithdrawalLimit memory _limit = withdrawalLimits[_property][_to];
		if (_limit.total != totals[_property]) {
			withdrawalLimits[_property][_to] = WithdrawalLimit(
				totals[_property],
				ERC20(_property).balanceOf(_to)
			);
		}
	}

	function calculateWithdrawableAmount(address _property, address _user)
		private
		view
		returns (uint256)
	{
		uint256 _last = lastWithdrawalPrices[_property][_user];
		WithdrawalLimit memory _limit = withdrawalLimits[_property][_user];
		uint256 priceGap = prices[_property] - _last;
		uint256 balance = ERC20(_property).balanceOf(_user);
		if (_limit.total == totals[_property]) {
			balance = _limit.balance;
		}
		uint256 value = priceGap * balance;
		return value;
	}

	function increment(address _property, uint256 value) internal {
		totals[_property] += value;
		prices[_property] += value.div(ERC20(_property).totalSupply());
	}
}
