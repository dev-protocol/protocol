pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../validate/AddressValidator.sol";

contract AddressConfig is Ownable {
	address public token = 0x98626E2C9231f03504273d55f397409deFD4a093;
	address public allocator;
	address public allocatorStorage;
	address public withdraw;
	address public withdrawStorage;
	address public marketFactory;
	address public marketGroup;
	address public propertyFactory;
	address public propertyGroup;
	address public metricsGroup;
	address public metricsFactory;
	address public policy;
	address public policyFactory;
	address public policySet;
	address public policyGroup;
	address public lockup;
	address public lockupStorage;
	address public voteTimes;
	address public voteCounter;

	function setAllocator(address _addr) public onlyOwner {
		allocator = _addr;
	}

	function setAllocatorStorage(address _addr) public onlyOwner {
		allocatorStorage = _addr;
	}

	function setWithdraw(address _addr) public onlyOwner {
		withdraw = _addr;
	}

	function setWithdrawStorage(address _addr) public onlyOwner {
		withdrawStorage = _addr;
	}

	function setMarketFactory(address _addr) public onlyOwner {
		marketFactory = _addr;
	}

	function setMarketGroup(address _addr) public onlyOwner {
		marketGroup = _addr;
	}

	function setPropertyFactory(address _addr) public onlyOwner {
		propertyFactory = _addr;
	}

	function setPropertyGroup(address _addr) public onlyOwner {
		propertyGroup = _addr;
	}

	function setMetricsFactory(address _addr) public onlyOwner {
		metricsFactory = _addr;
	}

	function setMetricsGroup(address _addr) public onlyOwner {
		metricsGroup = _addr;
	}

	function setPolicyFactory(address _addr) public onlyOwner {
		policyFactory = _addr;
	}

	function setPolicySet(address _addr) public onlyOwner {
		policySet = _addr;
	}

	function setPolicyGroup(address _addr) public onlyOwner {
		policyGroup = _addr;
	}

	function setPolicy(address _addr) public {
		new AddressValidator().validateAddress(msg.sender, policyFactory);
		policy = _addr;
	}

	function setToken(address _addr) public onlyOwner {
		token = _addr;
	}

	function setLockup(address _addr) public onlyOwner {
		lockup = _addr;
	}

	function setlockupStorage(address _addr) public onlyOwner {
		lockupStorage = _addr;
	}

	function setVoteTimes(address _addr) public onlyOwner {
		voteTimes = _addr;
	}

	function setVoteCounter(address _addr) public onlyOwner {
		voteCounter = _addr;
	}
}
