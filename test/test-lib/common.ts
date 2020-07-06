import BigNumber from 'bignumber.js'
import {providers} from 'ethers'
export const toBigNumber = (v: any): BigNumber => new BigNumber(v.toString())

export async function mine(
	provider: providers.Web3Provider,
	count: number
): Promise<void> {
	for (let i = 0; i < count; i++) {
		// eslint-disable-next-line no-await-in-loop
		await provider.send('evm_mine', [])
	}
}

// eslint-disable-next-line @typescript-eslint/promise-function-async
export const sleep = (msec: number) =>
	new Promise((resolve) => setTimeout(resolve, msec))
