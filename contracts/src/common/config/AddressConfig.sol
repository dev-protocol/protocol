pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract AddressConfig is Ownable {
	address public token = 0x98626E2C9231f03504273d55f397409deFD4a093;
	address public allocator;
	address public allocation;
	address public lastWithdrawalPrice;
	address public pendingWithdrawal;
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
	address public lockupValue;
	address public lockupPropertyValue;
	address public lockupWithdrawalStatus;
	address public voteTimes;
	address public voteCounter;

	function setAllocator(address _addr) public onlyOwner {
		allocator = _addr;
	}

	function setAllocation(address _addr) public onlyOwner {
		allocation = _addr;
	}

	function setLastWithdrawalPrice(address _addr) public onlyOwner {
		lastWithdrawalPrice = _addr;
	}

	function setPendingWithdrawal(address _addr) public onlyOwner {
		pendingWithdrawal = _addr;
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

	function setToken(address _addr) public onlyOwner {
		token = _addr;
	}

	function setPolicy(address _addr) public {
		require(msg.sender == policyFactory, "only policy factory contract");
		policy = _addr;
	}

	function setLockup(address _addr) public onlyOwner {
		lockup = _addr;
	}

	function setLockupValue(address _addr) public onlyOwner {
		lockupValue = _addr;
	}

	function setLockupPropertyValue(address _addr) public onlyOwner {
		lockupPropertyValue = _addr;
	}

	function setLockupWithdrawalStatus(address _addr) public onlyOwner {
		lockupWithdrawalStatus = _addr;
	}

	function setVoteTimes(address _addr) public onlyOwner {
		voteTimes = _addr;
	}

	function setVoteCounter(address _addr) public onlyOwner {
		voteCounter = _addr;
	}
}
