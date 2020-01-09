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

export function getPolicyAddress(
	transaction: Truffle.TransactionResponse
): string {
	const tmp = transaction.logs.filter(
		(e: {event: string}) => e.event === 'Create'
	)[0].args._policy
	return tmp
}

export function getMarketAddress(
	transaction: Truffle.TransactionResponse
): string {
	const tmp = transaction.logs.filter(
		(e: {event: string}) => e.event === 'Create'
	)[0].args._market
	return tmp
}

export const DEFAULT_ADDRESS = '0x0000000000000000000000000000000000000000'
