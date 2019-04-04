pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract State is Ownable {
	address public token = 0x98626E2C9231f03504273d55f397409deFD4a093;
	address[] public securities;
	mapping(address => bool) internal operator;
	mapping(string => address) internal securitiesMap;

	function addOperator(address addr) public onlyOwner {
		operator[addr] = true;
	}

	function setToken(address nextToken) public onlyOwner {
		token = address(nextToken);
	}

	function getToken() public view returns (address) {
		return token;
	}

	function addSecurity(string memory package, address security)
		public
	{
		require(operator[msg.sender] == true, 'Only the operator.');
		require(security != address(0), 'Security is an invalid address');
		require(
			securitiesMap[package] == address(0),
			'Security is already added'
		);
		securitiesMap[package] = security;
		securities.push(security);
	}

	function getSecurity(string memory package) public view returns (address) {
		return securitiesMap[package];
	}

	function getSecurities() public view returns (address[] memory) {
		return securities;
	}

	function getTotalBalance(address security) public view returns (uint) {
		return 1234567890; // Mock
	}
}
