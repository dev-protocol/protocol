pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/config/UsingConfig.sol";
import "../common/modifier/UsingModifier.sol";

contract Withdrawable is UsingConfig, UsingModifier {
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
	constructor(address _config)
		public
		UsingConfig(_config)
		UsingModifier(_config)
	{}

	function getRewardsAmount(address _property) public view returns (uint256) {
		return totals[_property];
	}

	function withdraw(address _property)
		public
		payable
		onlyProperty(_property)
	{
		uint256 _value = calculateWithdrawableAmount(_property, msg.sender);
		uint256 value = _value + pendingWithdrawals[_property][msg.sender];
		ERC20Mintable(_property).mint(msg.sender, value);
		lastWithdrawalPrices[_property][msg.sender] = prices[_property];
		pendingWithdrawals[_property][msg.sender] = 0;
	}

	function beforeBalanceChange(address _token, address _from, address _to)
		public
	{
		lastWithdrawalPrices[_token][_from] = prices[_token];
		lastWithdrawalPrices[_token][_to] = prices[_token];
		pendingWithdrawals[_token][_from] += calculateWithdrawableAmount(
			_token,
			_from
		);
		WithdrawalLimit memory _limit = withdrawalLimits[_token][_to];
		if (_limit.total != totals[_token]) {
			withdrawalLimits[_token][_to] = WithdrawalLimit(
				totals[_token],
				ERC20(_token).balanceOf(_to)
			);
		}
	}

	function calculateWithdrawableAmount(address _token, address _user)
		private
		view
		returns (uint256)
	{
		uint256 _last = lastWithdrawalPrices[_token][_user];
		WithdrawalLimit memory _limit = withdrawalLimits[_token][_user];
		uint256 priceGap = prices[_token] - _last;
		uint256 balance = ERC20(_token).balanceOf(_user);
		if (_limit.total == totals[_token]) {
			balance = _limit.balance;
		}
		uint256 value = priceGap * balance;
		return value;
	}

	function increment(address _token, uint256 value) internal {
		totals[_token] += value;
		prices[_token] += value.div(ERC20(_token).totalSupply());
	}
}
