pragma solidity 0.5.17;

import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {UsingConfig} from "../../src/common/config/UsingConfig.sol";
import {IMarketBehavior} from "../../interface/IMarketBehavior.sol";
import {IMarket} from "../../interface/IMarket.sol";

contract MarketTest2 is Ownable, IMarketBehavior, UsingConfig {
	string public schema = "[]";
	address private associatedMarket;
	mapping(address => string) internal keys;
	mapping(string => address) private addresses;

	constructor(address _config) public UsingConfig(_config) {}

	function authenticate(
		address _prop,
		string memory _args1,
		string memory,
		string memory,
		string memory,
		string memory,
		address market,
		address
	) public returns (bool) {
		require(msg.sender == associatedMarket, "Invalid sender");

		bytes32 idHash = keccak256(abi.encodePacked(_args1));
		address _metrics = IMarket(market).authenticatedCallback(_prop, idHash);
		keys[_metrics] = _args1;
		addresses[_args1] = _metrics;
		return true;
	}

	function getId(address _metrics) public view returns (string memory) {
		return keys[_metrics];
	}

	function getMetrics(string memory _id) public view returns (address) {
		return addresses[_id];
	}

	function setAssociatedMarket(address _associatedMarket) external onlyOwner {
		associatedMarket = _associatedMarket;
	}
}
