pragma solidity ^0.5.0;

import "../../common/storage/UsingStorage.sol";
import "../../common/validate/AddressValidator.sol";
import "../../common/config/UsingConfig.sol";

contract WithdrawalLimit is UsingConfig, UsingStorage {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function set(address _property, address _user, uint256 _total, uint256 _balance) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().withdraw()
		);

		eternalStorage().setUint(getTotalKey(_property, _user), _total);
		eternalStorage().setUint(getBalanceKey(_property, _user), _balance);
	}

	function get(address _property, address _user)
		external
		view
		returns (uint256, uint256)
	{
		uint256 total = eternalStorage().getUint(getTotalKey(_property, _user));
		uint256 balance = eternalStorage().getUint(getBalanceKey(_property, _user));
		return (total, balance);
	}

	function getTotal(address _property, address _user)
		external
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getTotalKey(_property, _user));
	}

	function getTotalKey(address _property, address _user)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_property, _user, "_total"));
	}

	function getBalanceKey(address _property, address _user)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_property, _user, "_balance"));
	}
}
