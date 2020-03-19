pragma solidity ^0.5.0;

import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract Temporarily is Ownable {
	bool private enabledTemporarily;

	constructor() internal {
		enabledTemporarily = true;
	}

	modifier enabledTemporarily() {
		require(isOwner(), "Ownable: caller is not the owner");
		require(enabledTemporarily, "this function is disabled");
		_;
	}

	function disabled() internal onlyOwner {
		enabledTemporarily = false;
	}
}
