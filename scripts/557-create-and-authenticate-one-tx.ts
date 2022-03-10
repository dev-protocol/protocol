import { ethGasStationFetcher } from '@devprotocol/util-ts'

const { CONFIG, EGS_TOKEN } = process.env
const gas = 6721975

const handler = async (
	callback: (err: Error | undefined) => void
): Promise<void> => {
	if (!CONFIG || !EGS_TOKEN) {
		return
	}

	const fastest = ethGasStationFetcher(EGS_TOKEN)

	// Generate current contract
	const [config] = await Promise.all([
		artifacts.require('AddressConfig').at(CONFIG),
	])
	console.log('Generated AddressConfig contract', config.address)

	// Deploy
	const nextMarketFactory = await artifacts
		.require('MarketFactory')
		.new(config.address, { gasPrice: await fastest(), gas })
	console.log('Deployed the new MarketFactory', nextMarketFactory.address)

	const nextPropertyFactory = await artifacts
		.require('PropertyFactory')
		.new(config.address, { gasPrice: await fastest(), gas })
	console.log('Deployed the new PropertyFactory', nextPropertyFactory.address)

	// Enable new Contract
	await config.setMarketFactory(nextMarketFactory.address, {
		gasPrice: await fastest(),
		gas,
	})
	console.log('Updated MarketFactory address')

	await config.setPropertyFactory(nextPropertyFactory.address, {
		gasPrice: await fastest(),
		gas,
	})
	console.log('Updated PropertyFactory address')

	callback(undefined)
}

export = handler
