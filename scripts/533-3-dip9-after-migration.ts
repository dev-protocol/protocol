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

	// Generate current contract
	const [config] = await Promise.all([
		artifacts.require('AddressConfig').at(CONFIG),
	])
	____log('Generated AddressConfig contract', config.address)

	const [metricsGroup] = await Promise.all([
		artifacts.require('MetricsGroup').at(await config.metricsGroup()),
	])
	____log('Generated current MetricsGroup contract', metricsGroup.address)

	const fastest = ethGasStationFetcher(EGS_TOKEN)

	// Deploy new MetricsGroup
	const nextMetricsGroup = await artifacts
		.require('MetricsGroup')
		.new(config.address, { gasPrice: await fastest(), gas })
	____log('Deployed the new MetricsGroup', nextMetricsGroup.address)

	// Delegate storage for MetricsGroup
	const metricsGroupStorageAddress = await metricsGroup.getStorageAddress()
	____log('Got EternalStorage address that uses by MetricsGroup')
	await nextMetricsGroup.setStorage(metricsGroupStorageAddress, {
		gasPrice: await fastest(),
		gas,
	})
	____log('Set EternalStorage address to the new MetricsGroup')

	// Activation
	await metricsGroup.changeOwner(nextMetricsGroup.address, {
		gasPrice: await fastest(),
		gas,
	})
	____log('Delegated EternalStorage owner to the new MetricsGroup')

	await config.setMetricsGroup(nextMetricsGroup.address, {
		gasPrice: await fastest(),
		gas,
	})
	____log('updated AddressConfig for MetricsGroup')

	callback(null)
}

export = handler
