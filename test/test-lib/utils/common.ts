import Web3 from 'web3'
import BigNumber from 'bignumber.js'
import {WEB3_URI} from './../const'
import {DevProtocolInstance} from '../instance'

export async function mine(count: number): Promise<void> {
	for (let i = 0; i < count; i++) {
		// eslint-disable-next-line no-await-in-loop
		await new Promise(function (resolve) {
			// eslint-disable-next-line no-undef
			web3.currentProvider.send(
				{
					jsonrpc: '2.0',
					method: 'evm_mine',
					params: [],
					id: 0,
				},
				resolve
			)
		})
	}
}

export const toBigNumber = (v: string | BigNumber | number): BigNumber =>
	new BigNumber(v)

export const collectsEth = (to: string, uri = WEB3_URI) => async (
	accounts: Truffle.Accounts,
	min = 50,
	rate = 0.5
): Promise<void> => {
	const getBalance = async (address: string): Promise<BigNumber> =>
		web3.eth.getBalance(address).then(toBigNumber)
	const web3 = new Web3(new Web3.providers.WebsocketProvider(uri))
	const minimum = toBigNumber(Web3.utils.toWei(`${min}`, 'ether'))
	accounts.map(async (account) => {
		const [balance, value] = await Promise.all([
			getBalance(to),
			getBalance(account),
		])
		if (balance.isLessThan(minimum)) {
			await web3.eth
				.sendTransaction({
					to,
					from: account,
					value: value.times(rate).toFixed(),
				})
				.catch((err: Error) => err)
		}
	})
}

// eslint-disable-next-line no-undef
export const getBlock = async (): Promise<number> => web3.eth.getBlockNumber()

export async function getAbstentionTimes(
	dev: DevProtocolInstance,
	propertyAddress: string
): Promise<number> {
	const times = await dev.voteTimesStorage.getVoteTimes()
	const timesByProperty = await dev.voteTimesStorage.getVoteTimesByProperty(
		propertyAddress
	)
	const sub = times.toNumber() - timesByProperty.toNumber()
	return sub
}

export function gasLogger(txRes: Truffle.TransactionResponse) {
	console.log(txRes.receipt.gasUsed)
}

export function keccak256(...values: string[]): string {
	// eslint-disable-next-line no-undef
	return (web3 as Web3).utils.soliditySha3(...values)!
}
