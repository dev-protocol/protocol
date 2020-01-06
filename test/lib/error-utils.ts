export function validateErrorMessage(
	result: Error,
	errorMessage: string,
	reason = true
): void {
	let message = `Returned error: VM Exception while processing transaction: revert ${errorMessage}`
	if (reason) {
		message += ` -- Reason given: ${errorMessage}.`
	}

	expect(result.message).to.be.equal(message)
}
