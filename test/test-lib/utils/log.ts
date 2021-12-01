export function getMarketAddress(
	transaction: Truffle.TransactionResponse
): string {
	const tmp = transaction.logs.filter(
		(e: { event: string }) => e.event === 'Create'
	)[0].args._market as string
	return tmp
}

export function getMetricsAddress(
	transaction: Truffle.TransactionResponse
): string {
	const tmp = transaction.logs.filter(
		(e: { event: string }) => e.event === 'Create'
	)[0].args._metrics as string
	return tmp
}

export function getPropertyAddress(
	transaction: Truffle.TransactionResponse
): string {
	const tmp = transaction.logs.filter(
		(e: { event: string }) => e.event === 'Create'
	)[0].args._property as string
	return tmp
}

export function getTransferToAddress(
	transaction: Truffle.TransactionResponse
): string {
	const tmp = transaction.logs.filter(
		(e: { event: string }) => e.event === 'Transfer'
	)[0].args.to as string
	return tmp
}
