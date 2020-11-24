pragma solidity >=0.5.17;

interface IMarketFactory {
	function create(address _addr) external returns (address);
}
