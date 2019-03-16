pragma solidity >=0.4.0;

contract Dev {
	mapping(address => uint) public store;

	constructor(uint val) public {
		set(val);
	}

	function set(uint val) public {
		store[msg.sender] = val;
	}

	function get() public view returns (uint) {
		return store[msg.sender];
	}
}
