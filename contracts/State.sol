pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract State is Ownable {
	address public token = 0x98626E2C9231f03504273d55f397409deFD4a093;
	address public allocator;
	address public marketFactory;
	mapping(address => bool) internal markets;
	mapping(string => address) internal propertyIdToAddress;
	mapping(address => string) internal propertyAddressToId;

	modifier onlyMarketFactory() {
		require(msg.sender == marketFactory, "Only Market Factory Contract");
		_;
	}

	modifier onlyMarket() {
		require(markets[msg.sender], "Only Market Contract");
		_;
	}

	function setAllocator(address _addr) public onlyOwner {
		allocator = _addr;
	}

	function setMarketFactory(address _addr) public onlyOwner {
		marketFactory = _addr;
	}

	function addMarket(address _addr) public onlyMarketFactory returns (bool) {
		markets[_addr] = true;
		return true;
	}

	function setToken(address nextToken) public onlyOwner {
		token = address(nextToken);
	}

	function getToken() public view returns (address) {
		return token;
	}

	function addProperty(string memory _id, address _prop) public onlyMarket {
		require(_prop != address(0), "Property is an invalid address");
		require(
			propertyIdToAddress[_id] == address(0),
			"Property is already added"
		);
		propertyIdToAddress[_id] = _prop;
		propertyAddressToId[_prop] = _id;
	}

	function getProperty(string memory _id) public view returns (address) {
		return propertyIdToAddress[_id];
	}

	function isProperty(address _addr) public view returns (bool) {
		return propertyIdToAddress[propertyAddressToId[_addr]] != address(0);
	}
}
