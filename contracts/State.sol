pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract State is Ownable {
	address public token = 0x98626E2C9231f03504273d55f397409deFD4a093;
	address[] public repositories;
	mapping(address => bool) internal operator;
	mapping(string => address) internal repositoriesMap;

	function addOperator(address addr) public onlyOwner {
		operator[addr] = true;
	}

	function isOperator(address addr) public view returns(bool) {
		return operator[addr];
	}

	function setToken(address nextToken) public onlyOwner {
		token = address(nextToken);
	}

	function getToken() public view returns (address) {
		return token;
	}

	function addRepository(string memory package, address repository)
		public
	{
		require(operator[msg.sender] == true, 'Only the operator.');
		require(repository != address(0), 'Repository is an invalid address');
		require(
			repositoriesMap[package] == address(0),
			'Repository is already added'
		);
		repositoriesMap[package] = repository;
		repositories.push(repository);
	}

	function getRepository(string memory package) public view returns (address) {
		return repositoriesMap[package];
	}

	function getRepositories() public view returns (address[] memory) {
		return repositories;
	}

	function getTotalBalance(address repository) public view returns (uint) {
		return 1234567890; // Mock
	}
}
