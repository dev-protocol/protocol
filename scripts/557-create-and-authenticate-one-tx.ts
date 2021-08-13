import { ethGasStationFetcher } from '@devprotocol/util-ts'

const { CONFIG, EGS_TOKEN } = process.env
const { log: ____log } = console
const gas = 6721975

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!CONFIG || !EGS_TOKEN) {
		return
	}

	const fastest = ethGasStationFetcher(EGS_TOKEN)

	// Generate current contract
	const [config] = await Promise.all([
		artifacts.require('AddressConfig').at(CONFIG),
	])
	____log('Generated AddressConfig contract', config.address)

	// Deploy
	const nextMarketFactory = await artifacts
		.require('MarketFactory')
		.new(config.address, { gasPrice: await fastest(), gas })
	____log('Deployed the new MarketFactory', nextMarketFactory.address)

	const nextPropertyFactory = await artifacts
		.require('PropertyFactory')
		.new(config.address, { gasPrice: await fastest(), gas })
	____log('Deployed the new PropertyFactory', nextPropertyFactory.address)

	// Enable new Contract
	await config.setMarketFactory(nextMarketFactory.address, {
		gasPrice: await fastest(),
		gas,
	})
	____log('Updated MarketFactory address')

	await config.setPropertyFactory(nextPropertyFactory.address, {
		gasPrice: await fastest(),
		gas,
	})
	____log('Updated PropertyFactory address')

	callback(null)
}

export = handler
