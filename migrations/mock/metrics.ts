import {
	MarketInstance,
	DummyDEVInstance//,
	//MarketTest1Instance,
	//MarketTest2Instance,
	//MarketTest3Instance
} from '../../types/truffle-contracts'
import {createInstance, AddressInfo, createInstanceByAddress} from './common'

export async function createMetrics(
	artifacts: Truffle.Artifacts,
	addressInfo: AddressInfo[],
	marketAddresses: string[]
): Promise<void> {
	console.log(1)
	const market = await createInstanceByAddress<MarketInstance>(
		'Market',
		marketAddresses[0],
		artifacts
	)
	console.log(2)
	const dummyDev = await createInstance<DummyDEVInstance>('DummyDEV', artifacts)
	console.log(3)
	await dummyDev.approve(market.address, 30000, {from: addressInfo[0].account})
	console.log(4)
	const result = await market.authenticate(
		addressInfo[0].property!,
		'arg1',
		'arg2',
		'arg3',
		'arg4',
		'arg5',
		{from: addressInfo[0].account}
	)
	console.log(result)
}
