/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()
const {log: ____log} = console

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	// Generate current contract
	const [config] = await Promise.all([
		artifacts.require('AddressConfig').at(process.env.CONFIG!),
	])
	____log('Generated AddressConfig contract', config.address)

	// Deploy
	const nextMarketFactory = await artifacts
		.require('MarketFactory')
		.new(config.address)
	____log('Deployed the new MarketFactory', nextMarketFactory.address)

	// Enable new Contract
	await config.setMarketFactory(nextMarketFactory.address)
	____log('Update MarketFactory address')
	callback(null)
}

export = handler
