import {
	MarketInstance,
	MarketFactoryInstance,
	MarketTest1Instance,
	MarketTest2Instance,
	MarketTest3Instance,
} from '../../types/truffle-contracts'
import {createInstance, AddressInfo, createInstanceByAddress} from './common'

export async function createMarket(
	artifacts: Truffle.Artifacts,
	addressInfo: AddressInfo[]
): Promise<string[]> {
	const marketAddresses = await create(artifacts)
	await vote(artifacts, addressInfo, marketAddresses)
	return marketAddresses
}

async function create(artifacts: Truffle.Artifacts): Promise<string[]> {
	async function getMarketAddress(marketAddr: string): Promise<string> {
		const result = await marketFactory.create(marketAddr)
		const marketAddress = await result.logs.filter(
			(e: {event: string}) => e.event === 'Create'
		)[0].args._market
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		console.log(`market${index}:${marketAddress} is created`)
		return marketAddress
	}

	let index = 0
	const marketAddresses: string[] = []
	const marketFactory = await createInstance<MarketFactoryInstance>(
		'MarketFactory',
		artifacts
	)
	let market:
		| MarketTest1Instance
		| MarketTest2Instance
		| MarketTest3Instance = await createInstance<MarketTest1Instance>(
		'MarketTest1',
		artifacts
	)
	marketAddresses.push(await getMarketAddress(market.address))
	index++
	market = await createInstance<MarketTest2Instance>('MarketTest2', artifacts)
	marketAddresses.push(await getMarketAddress(market.address))
	index++
	market = await createInstance<MarketTest3Instance>('MarketTest3', artifacts)
	marketAddresses.push(await getMarketAddress(market.address))
	return marketAddresses
}

async function vote(
	artifacts: Truffle.Artifacts,
	addressInfo: AddressInfo[],
	marketAddresses: string[]
): Promise<void> {
	async function enabled(marketIndex: number): Promise<void> {
		const market = await createInstanceByAddress<MarketInstance>(
			'Market',
			marketAddresses[marketIndex],
			artifacts
		)
		// I commented out to get the compilation through.
		// I'm deleting this source itself, so I'll leave it as is.
		//
		// await market.vote(addressInfo[0].property!, true, {
		// 	from: addressInfo[0].account,
		// })
		const result = await market.enabled()
		console.log(
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			`market${marketIndex}:${marketAddresses[marketIndex]} is enabled:${result}`
		)
	}

	await enabled(1)
}
