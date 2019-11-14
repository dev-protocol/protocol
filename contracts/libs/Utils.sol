pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract AddressValueMapping {
	using SafeMath for uint256;
	address[] private _addresses;
	mapping(address => uint256) private _values;

	function add(address _key, uint256 _value) public {
		_values[_key] = _values[_key].add(_value);
		_addresses.push(_key);
	}

	function get(address _key) public view returns (uint256) {
		return _values[_key];
	}

	function getTotalValues() public view returns (uint256) {
		uint256 arrayLength = _addresses.length;
		uint256 totalValue;
		for (uint256 i = 0; i < arrayLength; i++) {
			totalValue = totalValue.add(_values[_addresses[i]]);
		}
		return totalValue;
	}
}

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

contract QuickSort {
	// reference
	// https://gist.github.com/subhodi/b3b86cc13ad2636420963e692a4d896f
	function sort(uint256[] memory data) public returns (uint256[] memory) {
		quickSort(data, int256(0), int256(data.length - 1));
		return data;
	}

	function quickSort(uint256[] memory arr, int256 left, int256 right)
		private
	{
		int256 i = left;
		int256 j = right;
		if (i == j) return;
		uint256 pivot = arr[uint256(left + (right - left) / 2)];
		while (i <= j) {
			while (arr[uint256(i)] < pivot) i++;
			while (pivot < arr[uint256(j)]) j--;
			if (i <= j) {
				(arr[uint256(i)], arr[uint256(j)]) = (
					arr[uint256(j)],
					arr[uint256(i)]
				);
				i++;
				j--;
			}
		}
		if (left < j) quickSort(arr, left, j);
		if (i < right) quickSort(arr, i, right);
	}
}

contract MathUtils {
	using SafeMath for uint256;
	function sum(uint256[] memory data) public pure returns (uint256) {
		uint256 result = 0;
		for (uint256 i; i < data.length; i++) {
			result = result.add(data[i]);
		}
		return result;
	}
}
