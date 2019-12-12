pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../../common/validate/AddressValidator.sol";
import "../../common/storage/UsingStorage.sol";
import "../../common/config/UsingConfig.sol";

contract Allocation is UsingStorage, UsingConfig {
	using SafeMath for uint256;
	mapping(address => uint256) private _totals;
	mapping(address => uint256) private _prices;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function increment(address _property, uint256 _value) external {
		new AddressValidator().validateAddress(
			msg.sender,
			config().withdraw()
		);

		uint256 total = eternalStorage().getUint(getKey("_totals", _property));
		eternalStorage().setUint(
			getKey("_totals", _property),
			total.add(_value)
		);
		uint256 price = eternalStorage().getUint(getKey("_prices", _property));
		eternalStorage().setUint(
			getKey("_prices", _property),
			price.add(_value.div(ERC20(_property).totalSupply()))
		);
	}
	function getRewardsAmount(address _property)
		external
		view
		returns (uint256)
	{
		return _totals[_property];
	}

	function getCumulativePrice(address _property)
		external
		view
		returns (uint256)
	{
		return _prices[_property];
	}

	function getKey(string memory key, address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(key, _property));
	}
}
