pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Withdrawable {
	using SafeMath for uint;
	struct WithdrawalLimit {
		uint total;
		uint balance;
	}

	mapping(address => uint) totals;
	mapping(address => uint) prices;
	mapping(address => mapping(address => uint)) internal lastWithdrawalPrices;
	mapping(address => mapping(address => uint)) internal pendingWithdrawals;
	mapping(address => mapping(address => WithdrawalLimit)) internal withdrawalLimits;

	function withdraw(address _token) public payable {
		// DEPOSIT_TO_DISTRIBUTOR(); // Deposit a fee to the Distributor Factory Contract.
		uint _value = calculateWithdrawableAmount(_token, msg.sender);
		uint value = _value + pendingWithdrawals[_token][msg.sender];
		ERC20(token).mint(msg.sender, value);
		lastWithdrawalPrices[_token][msg.sender] = price;
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
		returns (uint)
	{
		uint _last = lastWithdrawalPrices[_token][_user];
		WithdrawalLimit memory _limit = withdrawalLimits[_token][_user];
		uint priceGap = price - _last;
		uint balance = ERC20(_token).balanceOf(_user);
		if (_limit.total == totals[_token]) {
			balance = _limit.balance;
		}
		uint value = priceGap * balance;
		return value;
	}

	function increment(address _token, uint value) internal {
		totals[repos] += value;
		prices[repos] += totals[repos].div(ERC20(repos).totalSupply());
	}
}
