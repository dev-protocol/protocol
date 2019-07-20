pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract State is Ownable {
	address public token = 0x98626E2C9231f03504273d55f397409deFD4a093;
	address public allocator;
	address public marketFactory;
	address public propertyFactory;
	mapping(address => bool) internal markets;
	mapping(address => bool) internal metrics;
	mapping(address => bool) internal properties;
	uint256 public totalIssuedMetrics;

	modifier onlyMarketFactory() {
		require(msg.sender == marketFactory, "Only Market Factory Contract");
		_;
	}

	modifier onlyPropertyFactory() {
		require(
			msg.sender == propertyFactory,
			"Only Property Factory Contract"
		);
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

	function setPropertyFactory(address _addr) public onlyOwner {
		propertyFactory = _addr;
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

	function addProperty(address _prop) public onlyPropertyFactory {
		require(_prop != address(0), "Property is an invalid address");
		properties[_prop] = true;
	}

	function isProperty(address _addr) public view returns (bool) {
		return properties[_addr];
	}

	function addMetrics(address _metrics) public onlyMarket {
		require(_metrics != address(0), "Metrics is an invalid address");
		totalIssuedMetrics += 1;
		metrics[_metrics] = true;
	}

	function isMetrics(address _metrics) public view returns (bool) {
		return metrics[_metrics];
	}

}
