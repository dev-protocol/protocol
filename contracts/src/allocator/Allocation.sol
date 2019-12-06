pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/storage/UsingStorage.sol";
import "../common/modifier/UsingModifier.sol";

contract Allocation is UsingModifier, UsingStorage {
	using SafeMath for uint256;
	mapping(address => uint256) private _totals;
	mapping(address => uint256) private _prices;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingModifier(_config) UsingStorage() {}

	function increment(address _property, uint256 _value) public onlyAllocator {
		_totals[_property] = _totals[_property].add(_value);
		_prices[_property] = _prices[_property].add(
			_value.div(ERC20(_property).totalSupply())
		);
	}
	function getRewardsAmount(address _property) public view returns (uint256) {
		return _totals[_property];
	}
	function getCumulativePrice(address _property)
		public
		view
		returns (uint256)
	{
		return _prices[_property];
	}
}
