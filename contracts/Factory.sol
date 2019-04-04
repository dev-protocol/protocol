pragma solidity ^0.5.0;

import './libs/Killable.sol';
import './UseState.sol';
import './Security.sol';

contract Factory is Killable, UseState {
	uint8 decimals = 18;
	uint supply = 10000000;

	function createSecurity(string memory package) public returns (address) {
		address exists = getSecurity(package);
		require(exists == address(0), 'Security is already created');
		Security security = new Security(
			package,
			package,
			package,
			decimals,
			supply
		);
		addSecurity(package, address(security));
	}
}
