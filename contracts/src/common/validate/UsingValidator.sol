pragma solidity 0.5.17;

// prettier-ignore
import {AddressValidator} from "contracts/src/common/validate/AddressValidator.sol";

/**
 * Module for contrast handling AddressValidator.
 */
contract UsingValidator {
	AddressValidator private _validator;

	/**
	 * Create a new AddressValidator contract when initialize.
	 */
	constructor() public {
		_validator = new AddressValidator();
	}

	/**
	 * Returns the set AddressValidator address.
	 */
	function addressValidator() internal view returns (AddressValidator) {
		return _validator;
	}
}
