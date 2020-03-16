import {MarketInstance, DevInstance} from '../../types/truffle-contracts'
import {createInstance, AddressInfo, createInstanceByAddress} from './common'

export async function createMetrics(
	artifacts: Truffle.Artifacts,
	addressInfo: AddressInfo[],
	marketAddresses: string[]
): Promise<void> {
	async function createMetrics(
		accountIndex: number,
		marketIndex: number
	): Promise<void> {
		// eslint-disable-next-line no-warning-comments
		// TODO
		const balance = await dev.balanceOf(addressInfo[accountIndex].account)
		const market = await createInstanceByAddress<MarketInstance>(
			'Market',
			marketAddresses[marketIndex],
			artifacts
		)
		await dev.approve(market.address, balance, {
			from: addressInfo[accountIndex].account
		})
		await market.authenticate(
			addressInfo[accountIndex].property!,
			'arg1' + idIndex.toString(),
			'arg2',
			'arg3',
			'arg4',
			'arg5',
			{from: addressInfo[accountIndex].account}
		)
		idIndex++
		console.log(
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			`metrics:  market:${marketAddresses[marketIndex]},property:${addressInfo[accountIndex].property}`
		)
	}

	const dev = await createInstance<DevInstance>('Dev', artifacts)
	let idIndex = 0
	await createMetrics(0, 0)
	await createMetrics(3, 0)
	await createMetrics(5, 0)
	await createMetrics(1, 1)
	await createMetrics(5, 1)
}
