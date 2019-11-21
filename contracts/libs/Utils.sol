pragma solidity ^0.5.0;

contract AddressSet {
	address[] private _addresses;
	mapping(address => bool) private _addressMap;

	function add(address _address) public {
		if (_addressMap[_address]) {
			return;
		}
		_addresses.push(_address);
		_addressMap[_address] = true;
	}

	function get() public view returns (address[] memory) {
		return _addresses;
	}

	function length() public view returns (uint256) {
		return _addresses.length;
	}

	function hasAddress(address _address) public view returns (bool) {
		return _addressMap[_address];
	}
}

contract AddressUintMap {
	address[] private _addresses;
	mapping(address => bool) private _addressMap;
	mapping(address => uint256) private _addressValueMap;

	function add(address _address, uint256 value) public {
		_addressValueMap[_address] += value;
		if (_addressMap[_address]){
			return;
		}
		_addressMap[_address] = true;
		_addresses.push(_address);
	}

	function get(address _address) public view returns (uint256) {
		return _addressValueMap[_address];
	}

	function getSumAllValue() public view returns (uint256) {
		uint256 sum;
		for (uint256 i = 0; i < _addresses.length; i++) {
			sum += _addressValueMap[_addresses[i]];
		}
		return sum;
	}
}
