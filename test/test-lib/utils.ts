import Web3 from 'web3'
import BigNumber from 'bignumber.js'

export function validateErrorMessage(
	result: Error,
	errorMessage: string,
	reason = true
): void {
	const message = reason ? `Reason given: ${errorMessage}` : errorMessage
	expect(result.message).to.include(message)
}

export function validateAddressErrorMessage(
	result: Error,
	reason = true
): void {
	validateErrorMessage(result, 'this is illegal address', reason)
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

export const getEventValue = (deployedContract: any, uri: string) => async (
	name: string,
	arg: string,
	timeout = 10000
): Promise<Error | string> =>
	new Promise((resolve, reject) => {
		setTimeout(() => reject(new Error()), timeout)
		watch(deployedContract, uri)(name, (err, values) => {
			if (err) {
				return reject(err)
			}

			resolve(values[arg])
		})
	})

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

export const toBigNumber = (v: string | BigNumber | number): BigNumber =>
	new BigNumber(v)

export const collectsEth = (to: string, uri = 'ws://localhost:7545') => async (
	accounts: Truffle.Accounts,
	min = 50,
	rate = 0.5
): Promise<void> => {
	const getBalance = async (address: string): Promise<BigNumber> =>
		web3.eth.getBalance(address).then(toBigNumber)
	const web3 = new Web3(new Web3.providers.WebsocketProvider(uri))
	const minimum = toBigNumber(Web3.utils.toWei(`${min}`, 'ether'))
	accounts.map(async account => {
		const [balance, value] = await Promise.all([
			getBalance(to),
			getBalance(account)
		])
		if (balance.isLessThan(minimum)) {
			await web3.eth
				.sendTransaction({
					to,
					from: account,
					value: value.times(rate).toFixed()
				})
				.catch((err: Error) => err)
		}
	})
}

export const DEFAULT_ADDRESS = '0x0000000000000000000000000000000000000000'
