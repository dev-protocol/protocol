pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./libs/Killable.sol";
import "./Distributor.sol";

contract DistributorFactory is Killable, Ownable {
	mapping(string => address) distributors;

	//TODO: calculate the term from the stored last run date
	function distribute(string memory start, string memory end, uint value)
		public
		onlyOwner
	{
		Distributor dist = new Distributor(start, end, value);
		distributors[start] = address(dist);
	}
}
