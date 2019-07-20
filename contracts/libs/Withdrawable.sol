pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Withdrawable {
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

	function withdraw(address _token) public payable {
		uint256 _value = calculateWithdrawableAmount(_token, msg.sender);
		uint256 value = _value + pendingWithdrawals[_token][msg.sender];
		// Should be _token is Dev
		ERC20Mintable(_token).mint(msg.sender, value);
		lastWithdrawalPrices[_token][msg.sender] = prices[_token];
		pendingWithdrawals[_token][msg.sender] = 0;
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
		prices[_token] += totals[_token].div(ERC20(_token).totalSupply());
	}
}
