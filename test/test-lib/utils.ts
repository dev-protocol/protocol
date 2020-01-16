import Web3 from 'web3'

export function validateErrorMessage(
	result: Error,
	errorMessage: string,
	reason = true
): void {
	const message = reason ? `Reason given: ${errorMessage}` : errorMessage
	expect(result.message).to.include(message)
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
	console.log(transaction.logs)
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

export const watch = (deployedContract: any, uri: string) => (
	name: string,
	handler: (err: Error, values: {[key: string]: string}) => void
): void => {
	const {contract: deployed} = deployedContract
	const web3WithWebsockets = new Web3(new Web3.providers.WebsocketProvider(uri))
	const {events} = new web3WithWebsockets.eth.Contract(
		deployed._jsonInterface,
		deployed._address
	)

	events.allEvents({fromBlock: 0, toBlock: 'latest'}, (err: Error, e: any) => {
		if (e.event === name) {
			handler(err, e.returnValues)
		}
	})
}

export const waitForEvent = (deployedContract: any, uri: string) => async (
	name: string,
	timeout = 10000
): Promise<Error | void> =>
	new Promise((resolve, reject) => {
		setTimeout(() => reject(new Error()), timeout)
		watch(deployedContract, uri)(name, err => {
			if (err) {
				return reject(err)
			}

			resolve()
		})
	})

export const DEFAULT_ADDRESS = '0x0000000000000000000000000000000000000000'
