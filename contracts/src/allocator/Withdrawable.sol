pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/config/UsingConfig.sol";
import "./Allocation.sol";

contract Withdrawable is UsingConfig{
	using SafeMath for uint256;
	struct WithdrawalLimit {
		uint256 total;
		uint256 balance;
	}

	mapping(address => mapping(address => uint256)) private lastWithdrawalPrices;
	mapping(address => mapping(address => uint256)) private pendingWithdrawals;
	mapping(address => mapping(address => WithdrawalLimit)) private withdrawalLimits;

	constructor(address _config) public UsingConfig(_config) {}

	function withdraw(address _token) public payable {
		uint256 _value = calculateWithdrawableAmount(_token, msg.sender);
		uint256 value = _value + pendingWithdrawals[_token][msg.sender];
		// Should be _token is Dev
		ERC20Mintable(_token).mint(msg.sender, value);
		uint256 price = Allocation(config().allocation()).getCumulativePrice(_token);
		lastWithdrawalPrices[_token][msg.sender] = price;
		pendingWithdrawals[_token][msg.sender] = 0;
	}

	function beforeBalanceChange(address _token, address _from, address _to)
		public
	{
		uint256 price = Allocation(config().allocation()).getCumulativePrice(_token);
		lastWithdrawalPrices[_token][_from] = price;
		lastWithdrawalPrices[_token][_to] = price;
		pendingWithdrawals[_token][_from] += calculateWithdrawableAmount(
			_token,
			_from
		);
		WithdrawalLimit memory _limit = withdrawalLimits[_token][_to];
		uint256 total = Allocation(config().allocation()).getRewardsAmount(_token);
		if (_limit.total != total) {
			withdrawalLimits[_token][_to] = WithdrawalLimit(
				total,
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
		uint256 price = Allocation(config().allocation()).getCumulativePrice(_token);
		uint256 priceGap = price - _last;
		uint256 balance = ERC20(_token).balanceOf(_user);
		uint256 total = Allocation(config().allocation()).getRewardsAmount(_token);
		if (_limit.total == total) {
			balance = _limit.balance;
		}
		uint256 value = priceGap * balance;
		return value;
	}
}
