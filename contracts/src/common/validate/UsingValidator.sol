pragma solidity ^0.5.0;

import {AddressValidator} from "contracts/src/common/validate/AddressValidator.sol";

contract UsingValidator {
	AddressValidator private _validator;
	constructor() public {
		_validator = new AddressValidator();
	}
	function addressValidator() internal view returns (AddressValidator) {
		return _validator;
	}
}
