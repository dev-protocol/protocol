import {DummyDEVInstance} from '../../types/truffle-contracts'
import {AddressInfo, createInstance} from './common'
import BigNumber from 'bignumber.js'

export async function changeBalance(
	artifacts: Truffle.Artifacts,
	addressInfo: AddressInfo[]
): Promise<void> {
	// Settings
	const transferAddressIndex = [1, 3, 5, 7, 8, 9]
	const transferValue = [50000, 200000, 30000, 1000, 100000, 10000]

	const dummyDev = await createInstance<DummyDEVInstance>('DummyDEV', artifacts)
	const tmp = await dummyDev.decimals()
	const decimals = 10 ** tmp.toNumber()
	console.log('dev token balance infomation')
	for (let i = 0; i < transferAddressIndex.length; i++) {
		const idx = transferAddressIndex[i]
		const address = addressInfo[idx].account
		const value = transferValue[i]
		// eslint-disable-next-line no-await-in-loop
		await dummyDev.transfer(address, new BigNumber(value * decimals))
		// eslint-disable-next-line no-await-in-loop
		const tmp = await dummyDev.balanceOf(address)
		const balance = new BigNumber(tmp).dividedBy(new BigNumber(decimals))
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		console.log(`${address}: ${balance}`)
	}
}
