pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./UseState.sol";

contract DevLockUp is UseState{
	using SafeMath for uint256;
	mapping(address => mapping(address => uint256)) private _lockupedDev;
	function lockUp(address propatyAddress, uint256 value) public {
		ERC20 devToken = ERC20(getToken());
		uint256 balance = devToken.balanceOf(msg.sender);
		require(
			value <= balance,
			"insufficient balance"
		);
		devToken.transfer(propatyAddress, value);
		_lockupedDev[msg.sender][propatyAddress] = value;
	}
}
