pragma solidity ^0.5.0;


contract AddressUIntMap{
	mapping(bytes32 => mapping(address => uint256)) private _addressUIntMap;
	function increment(bytes32 _key, address _address) public {
		_addressUIntMap[_key][_address]++;
	}
	function set(bytes32 _key, address _address, uint256 _value) public {
		_addressUIntMap[_key][_address] = _value;
	}
	function get(bytes32 _key, address _address) public view returns(uint256){
		return _addressUIntMap[_key][_address];
	}
}
