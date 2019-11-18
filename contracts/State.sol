pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract State is Ownable {
	address public token = 0x98626E2C9231f03504273d55f397409deFD4a093;
	address public allocator;
	address public marketFactory;
	address public marketGroup;
	address public propertyFactory;
	address public propertyGroup;
	address public metricsGroup;
	address public policyFactory;
	address public policy;
	address public lockup;
	address public policyVoteAbstentionCounter;

	modifier onlyPolicyFactory() {
		require(msg.sender == policyFactory, "Only Policy Factory Contract");
		_;
	}

	function setAllocator(address _addr) public onlyOwner {
		allocator = _addr;
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

	function setMetricsGroup(address _addr) public onlyOwner {
		metricsGroup = _addr;
	}

	function setPolicyFactory(address _addr) public onlyOwner {
		policyFactory = _addr;
	}

	function setToken(address nextToken) public onlyOwner {
		token = address(nextToken);
	}

	function getToken() public view returns (address) {
		return token;
	}

	function setPolicy(address _addr) public onlyPolicyFactory {
		policy = _addr;
	}

	function setLockup(address _addr) public onlyOwner {
		lockup = _addr;
	}

	function setPolicyVoteAbstentionCounter(address _addr) public onlyOwner {
		policyVoteAbstentionCounter = _addr;
	}
}
