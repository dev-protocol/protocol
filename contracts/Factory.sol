pragma solidity ^0.5.0;

import "./libs/Killable.sol";
import "./UseState.sol";
import "./Repository.sol";

contract Factory is Killable, UseState {
	uint8 decimals = 18;
	uint supply = 10000000;

	function createRepository(string memory package) public returns (address) {
		address exists = getRepository(package);
		require(exists == address(0), "Repository is already created");
		Repository repository = new Repository(
			package,
			package,
			package,
			decimals,
			supply
		);
		addRepository(package, address(repository));
	}
}
