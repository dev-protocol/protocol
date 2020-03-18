export function validateErrorMessage(
	result: any,
	errorMessage: string,
	reason = true
): void {
	const message = reason ? `Reason given: ${errorMessage}` : errorMessage
	expect(result).to.be.an.instanceOf(Error)
	expect((result as Error).message).to.include(message)
}

export function validateAddressErrorMessage(result: any, reason = true): void {
	validateErrorMessage(result, 'this is illegal address', reason)
}

export function validatePauseErrorMessage(result: any, reason = true): void {
	validateErrorMessage(result, 'You cannot use that', reason)
}

export function validatePauseOnlyOwnerErrorMessage(
	result: any,
	reason = true
): void {
	validateErrorMessage(
		result,
		'PauserRole: caller does not have the Pauser role',
		reason
	)
}
