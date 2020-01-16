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

export function getMetricsAddress(
	transaction: Truffle.TransactionResponse
): string {
	const tmp = transaction.logs.filter(
		(e: {event: string}) => e.event === 'Create'
	)[0].args._metrics
	return tmp
}

export function getPropertyAddress(
	transaction: Truffle.TransactionResponse
): string {
	const tmp = transaction.logs.filter(
		(e: {event: string}) => e.event === 'Create'
	)[0].args._property
	return tmp
}

export async function mine(count: number): Promise<void> {
	for (let i = 0; i < count; i++) {
		// eslint-disable-next-line no-await-in-loop
		await new Promise(function(resolve) {
			// eslint-disable-next-line no-undef
			web3.currentProvider.send(
				{
					jsonrpc: '2.0',
					method: 'evm_mine',
					params: [],
					id: 0
				},
				resolve
			)
		})
	}
}

export const DEFAULT_ADDRESS = '0x0000000000000000000000000000000000000000'
