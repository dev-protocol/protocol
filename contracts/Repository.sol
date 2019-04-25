pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./UseState.sol";

contract Repository is ERC20, ERC20Detailed, Ownable, UseState {
	string public package;
	uint public total;
	uint public price;
	struct WithdrawalLimit {
		uint total;
		uint balance;
	}
	mapping(address => uint) internal lastWithdrawals;
	mapping(address => WithdrawalLimit) internal withdrawalLimits;
	mapping(address => bool) internal distributor;

	constructor(
		string memory _package,
		string memory name,
		string memory symbol,
		uint8 decimals,
		uint supply
	) public ERC20Detailed(name, symbol, decimals) {
		package = _package;
		_mint(msg.sender, supply);
	}

	function getPackage() public view returns (string memory) {
		return package;
	}

	function addDistributor(address addr) public onlyOwner {
		distributor[addr] = true;
	}

	function isDistributor() public view returns (bool) {
		return distributor[msg.sender];
	}

	modifier onlyDistributor() {
		require(isDistributor(), "Only Distributor");
		_;
	}

	function increment(uint _value) public onlyDistributor {
		total += _value;
		price += total / totalSupply();
	}

	function withdraw() public {
		WithdrawalLimit memory _limit = withdrawalLimits[msg.sender];
		uint _price = price - lastWithdrawals[msg.sender];
		uint _balance = balanceOf(msg.sender);
		if (_limit.total == total) {
			_balance = _limit.balance;
		}
		uint _value = _price * _balance;
		ERC20(getToken()).transfer(msg.sender, _value);
		lastWithdrawals[msg.sender] = price;
	}

	function setWithdrawalLimit(address to, uint value) internal {
		WithdrawalLimit memory _limit = withdrawalLimits[to];
		if (_limit.total == total) {
			withdrawalLimits[to] = WithdrawalLimit(
				total,
				_limit.balance + value
			);
		} else {
			withdrawalLimits[to] = WithdrawalLimit(total, value);
		}
		lastWithdrawals[to] = price;
	}

	function transfer(address to, uint256 value) public returns (bool) {
		withdraw();
		_transfer(msg.sender, to, value);
		setWithdrawalLimit(to, value);
		return true;
	}
}
