pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "./UseState.sol";
import "./Allocator.sol";

contract Property is ERC20, ERC20Detailed, UseState {
	address public market;
	string public id;

	constructor(
		address _market,
		string memory _id,
		string memory _name,
		string memory _symbol,
		uint _decimals,
		uint _supply
	) public ERC20Detailed(_name, _symbol, _decimals) {
		market = _market;
		id = _id;
		_mint(address(0), _supply);
	}

	function increase(uint _value) public returns (bool) {
		// not implemented yet.
	}

	function contribute(uint _value) public returns (bool) {
		// not implemented yet.
	}

	function transfer(address _to, uint256 _value) public returns (bool) {
		address distributor = getDistributor();
		Allocator(distributor).beforeBalanceChange(
			address(this),
			msg.sender,
			_to
		);
		_transfer(msg.sender, _to, _value);
		return true;
	}

	function isAuthorized() public returns (bool) {
		return balanceOf(address(0)) == 0;
	}

	function authorizeOwner(address _owner) public returns (bool) {
		require(
			msg.sender == market,
			"Don't call from other than Market Contract"
		);
		require(isAuthorized() == false, "Already authorized");
		_transfer(address(0), _owner, totalSupply());
		return true;
	}
}
