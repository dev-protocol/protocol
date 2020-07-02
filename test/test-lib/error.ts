import {expect} from 'chai'

export function validateErrorMessage(result: any, errorMessage: string): void {
	expect(result).to.be.an.instanceOf(Error)
	expect((result as Error).message).to.include(errorMessage)
}

export function validateAddressErrorMessage(result: any): void {
	validateErrorMessage(result, 'this is illegal address')
}

export function validatePauseErrorMessage(result: any): void {
	validateErrorMessage(result, 'You cannot use that')
}

export function validatePauseOnlyOwnerErrorMessage(result: any): void {
	validateErrorMessage(
		result,
		'PauserRole: caller does not have the Pauser role'
	)
}
