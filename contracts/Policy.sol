pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./PolicyInterface.sol";

contract Policy {
	using SafeMath for uint256;
	address private owner;
	PolicyInterface private innerPolicy;
	constructor(address own, address innerPolicyAddress) public {
		owner = own;
		innerPolicy = PolicyInterface(innerPolicyAddress);
	}
	function rewards(uint256 lockups, uint256 assets) public view returns(uint256){
		return innerPolicy.rewards(lockups, assets);
	}

	function holdersShare(uint256 amount, uint256 lockups) public view returns(uint256){
		return innerPolicy.holdersShare(amount, lockups);
	}

	function assetValue(uint256 value, uint256 lockups) public view returns(uint256){
		return innerPolicy.assetValue(value, lockups);
	}

	function authenticationFee(uint256 assets, uint256 propertyAssets) public view returns(uint256){
		return innerPolicy.authenticationFee(assets, propertyAssets);
	}

	function marketApproval(uint256 agree, uint256 opposite) public view returns(bool){
		return innerPolicy.marketApproval(agree, opposite);
	}

	function policyApproval(uint256 agree, uint256 opposite) public view returns(bool){
		return innerPolicy.policyApproval(agree, opposite);
	}

	function marketVotingBlocks() public view returns(uint256){
		return innerPolicy.marketVotingBlocks();
	}

	function policyVotingBlocks() public view returns(uint256){
		return innerPolicy.policyVotingBlocks();
	}

	function abstentionPenalty(uint256 count) public view returns(bool){
		return innerPolicy.abstentionPenalty();
	}

	function vote() public {
		_;
	}
}
