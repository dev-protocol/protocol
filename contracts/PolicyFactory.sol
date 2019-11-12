pragma solidity ^0.5.0;

import "./Policy.sol";

contract PolicyFactory {
	address private owner;

	constructor() public {
		owner = msg.sender;
	}

	event Create(address indexed _from, address _property);

	function createPolicy(address newPolicyAddress) public returns (address) {
		Policy policy = new Policy(owner, newPolicyAddress);
		address policyAddress = address(policy);
		emit Create(msg.sender, policyAddress);
		return policyAddress;
	}

	function killPolicy(address policyAddress) private {
		require(msg.sender == _owner, "Ownable: caller is not the owner");
		policy = Policy(policyAddress);
		policy.kill();
	}
}
// TODO
//投票者が新しいコントラクトを承認する仕組み
//アクティブなポリシーは常に一つ
//古いポリシーは参照されない

