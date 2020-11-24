pragma solidity 0.5.17;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {
	ERC20Detailed
} from "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {IAllocator} from "contracts/interface/IAllocator.sol";
import {IProperty} from "contracts/interface/IProperty.sol";

/**
 * A contract that represents the assets of the user and collects staking from the stakers.
 * Property contract inherits ERC20.
 * Holders of Property contracts(tokens) receive holder rewards according to their share.
 */
contract Property is ERC20, ERC20Detailed, UsingConfig, IProperty {
	using SafeMath for uint256;
	uint8 private constant PROPERTY_DECIMALS = 18;
	uint256 private constant SUPPLY = 10000000000000000000000000;
	address public author;

	/**
	 * Initializes the passed value as AddressConfig address, author address, token name, and token symbol.
	 */
	constructor(
		address _config,
		address _own,
		string memory _name,
		string memory _symbol
	)
		public
		UsingConfig(_config)
		ERC20Detailed(_name, _symbol, PROPERTY_DECIMALS)
	{
		/**
		 * Validates the sender is PropertyFactory contract.
		 */
		require(
			msg.sender == config().propertyFactory(),
			"this is illegal address"
		);

		/**
		 * Sets the author.
		 */
		author = _own;

		/**
		 * Mints to the author 100% of the total supply.
		 */
		_mint(author, SUPPLY);
	}

	/**
	 * Changing the author
	 */
	function changeAuthor(address _nextAuthor) external {
		/**
		 * Validates the sender is current author.
		 */
		require(msg.sender == author, "illegal sender");

		/**
		 * Changes the author.
		 */
		author = _nextAuthor;
	}

	/**
	 * Hook on `transfer` and call `Withdraw.beforeBalanceChange` function.
	 */
	function transfer(address _to, uint256 _value) public returns (bool) {
		/**
		 * Validates the destination is not 0 address.
		 */
		require(_to != address(0), "this is illegal address");
		require(_value != 0, "illegal transfer value");

		/**
		 * Calls Withdraw contract via Allocator contract.
		 * Passing through the Allocator contract is due to the historical reason for the old Property contract.
		 */
		IAllocator(config().allocator()).beforeBalanceChange(
			address(this),
			msg.sender,
			_to
		);

		/**
		 * Calls the transfer of ERC20.
		 */
		_transfer(msg.sender, _to, _value);
		return true;
	}

	/**
	 * Hook on `transferFrom` and call `Withdraw.beforeBalanceChange` function.
	 */
	function transferFrom(
		address _from,
		address _to,
		uint256 _value
	) public returns (bool) {
		/**
		 * Validates the source and destination is not 0 address.
		 */
		require(_from != address(0), "this is illegal address");
		require(_to != address(0), "this is illegal address");
		require(_value != 0, "illegal transfer value");

		/**
		 * Calls Withdraw contract via Allocator contract.
		 * Passing through the Allocator contract is due to the historical reason for the old Property contract.
		 */
		IAllocator(config().allocator()).beforeBalanceChange(
			address(this),
			_from,
			_to
		);

		/**
		 * Calls the transfer of ERC20.
		 */
		_transfer(_from, _to, _value);

		/**
		 * Reduces the allowance amount.
		 */
		uint256 allowanceAmount = allowance(_from, msg.sender);
		_approve(
			_from,
			msg.sender,
			allowanceAmount.sub(
				_value,
				"ERC20: transfer amount exceeds allowance"
			)
		);
		return true;
	}

	/**
	 * Transfers the staking amount to the original owner.
	 */
	function withdraw(address _sender, uint256 _value) external {
		/**
		 * Validates the sender is Lockup contract.
		 */
		require(msg.sender == config().lockup(), "this is illegal address");

		/**
		 * Transfers the passed amount to the original owner.
		 */
		ERC20 devToken = ERC20(config().token());
		bool result = devToken.transfer(_sender, _value);
		require(result, "dev transfer failed");
	}
}
