pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract AddressValueMapping {
	using SafeMath for uint256;
	address[] private _addresses;
	mapping (address => uint256) private _values;

	function add(address _key, uint256 _value) public {
		_values[_key] = _values[_key].add(_value);
		_addresses.push(_key);
	}

	function get(address _key) public view returns (uint256){
		return _values[_key];
	}

	function getTotalValues() public view returns (uint256){
		uint256 arrayLength = _addresses.length;
		uint256 totalValue;
		for (uint256 i = 0; i<arrayLength; i++) {
			totalValue = totalValue.add(_values[_addresses[i]]);
		}
		return totalValue;
	}
}
