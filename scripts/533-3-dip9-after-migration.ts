import { ethGasStationFetcher } from '@devprotocol/util-ts'

const { CONFIG, EGS_TOKEN } = process.env
const gas = 6721975

const handler = async (
	callback: (err: Error | undefined) => void
): Promise<void> => {
	if (!CONFIG || !EGS_TOKEN) {
		return
	}

	// Generate current contract
	const [config] = await Promise.all([
		artifacts.require('AddressConfig').at(CONFIG),
	])
	console.log('Generated AddressConfig contract', config.address)

	const [metricsGroup] = await Promise.all([
		artifacts.require('MetricsGroup').at(await config.metricsGroup()),
	])
	console.log('Generated current MetricsGroup contract', metricsGroup.address)

	const fastest = ethGasStationFetcher(EGS_TOKEN)

	// Deploy new MetricsGroup
	const nextMetricsGroup = await artifacts
		.require('MetricsGroup')
		.new(config.address, { gasPrice: await fastest(), gas })
	console.log('Deployed the new MetricsGroup', nextMetricsGroup.address)

	// Delegate storage for MetricsGroup
	const metricsGroupStorageAddress = await metricsGroup.getStorageAddress()
	console.log('Got EternalStorage address that uses by MetricsGroup')
	await nextMetricsGroup.setStorage(metricsGroupStorageAddress, {
		gasPrice: await fastest(),
		gas,
	})
	console.log('Set EternalStorage address to the new MetricsGroup')

	// Activation
	await metricsGroup.changeOwner(nextMetricsGroup.address, {
		gasPrice: await fastest(),
		gas,
	})
	console.log('Delegated EternalStorage owner to the new MetricsGroup')

	await config.setMetricsGroup(nextMetricsGroup.address, {
		gasPrice: await fastest(),
		gas,
	})
	console.log('updated AddressConfig for MetricsGroup')

	callback(undefined)
}

export = handler
