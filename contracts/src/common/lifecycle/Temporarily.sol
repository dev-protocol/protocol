pragma solidity ^0.5.0;

import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract Temporarily is Ownable {
	bool private enabled = true;

	modifier enabledTemporarily() {
		require(isOwner(), "Ownable: caller is not the owner");
		require(enabled, "this function is disabled");
		_;
	}

	function disabled() internal onlyOwner {
		enabled = false;
	}
}
