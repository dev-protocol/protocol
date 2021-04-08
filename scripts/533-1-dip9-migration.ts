import { ethGasStationFetcher } from '@devprotocol/util-ts'

const { CONFIG, EGS_TOKEN, DEV_MINTER } = process.env
const { log: ____log } = console
const gas = 6721975

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!CONFIG || !EGS_TOKEN || !DEV_MINTER) {
		return
	}

	// Generate current contract
	const [config] = await Promise.all([
		artifacts.require('AddressConfig').at(CONFIG),
	])
	____log('Generated AddressConfig contract', config.address)

	const [lockup, metricsGroup, dev] = await Promise.all([
		artifacts.require('Lockup').at(await config.lockup()),
		artifacts.require('MetricsGroup').at(await config.metricsGroup()),
		artifacts.require('Dev').at(await config.token()),
	])
	____log('Generated current Lockup contract', lockup.address)
	____log('Generated current Dev contract', dev.address)

	const fastest = ethGasStationFetcher(EGS_TOKEN)

	// Deploy new Lockup
	const nextLockup = await artifacts
		.require('Lockup')
		.new(config.address, DEV_MINTER, { gasPrice: await fastest(), gas })
	____log('Deployed the new Lockup', nextLockup.address)

	// Deploy MetricsGroupMigration as a new MetricsGroup
	const nextMetricsGroup = await artifacts
		.require('MetricsGroupMigration')
		.new(config.address, { gasPrice: await fastest(), gas })
	____log(
		'Deployed the new MetricsGroupMigration as a new MetricsGroup',
		nextMetricsGroup.address
	)

	// Deploy new MetricsFactory
	const nextMetricsFactory = await artifacts
		.require('MetricsFactory')
		.new(config.address, { gasPrice: await fastest(), gas })
	____log('Deployed the new MetricsFactory', nextMetricsFactory.address)

	// Deploy new Withdraw
	const nextWithdraw = await artifacts
		.require('Withdraw')
		.new(config.address, DEV_MINTER, { gasPrice: await fastest(), gas })
	____log('Deployed the new Withdraw', nextWithdraw.address)

	// Add minter
	await dev.addMinter(nextLockup.address, { gasPrice: await fastest(), gas })
	____log('Added next Lockup as a minter')
	await dev.addMinter(nextWithdraw.address, { gasPrice: await fastest(), gas })
	____log('Added next Withdraw as a minter')

	// Delegate storage for Lockup
	const lockupStorageAddress = await lockup.getStorageAddress()
	____log('Got EternalStorage address that uses by Lockup')
	await nextLockup.setStorage(lockupStorageAddress, {
		gasPrice: await fastest(),
		gas,
	})
	____log('Set EternalStorage address to the new Lockup')

	// Delegate storage for MetricsGroup
	const metricsGroupStorageAddress = await metricsGroup.getStorageAddress()
	____log('Got EternalStorage address that uses by MetricsGroup')
	await nextMetricsGroup.setStorage(metricsGroupStorageAddress, {
		gasPrice: await fastest(),
		gas,
	})
	____log('Set EternalStorage address to the new MetricsGroup')

	// Activation
	await lockup.changeOwner(nextLockup.address, {
		gasPrice: await fastest(),
		gas,
	})
	____log('Delegated EternalStorage owner to the new Lockup')

	await config.setLockup(nextLockup.address, { gasPrice: await fastest(), gas })
	____log('updated AddressConfig for Lockup')

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

	await config.setWithdraw(nextWithdraw.address, {
		gasPrice: await fastest(),
		gas,
	})
	____log('updated AddressConfig for Withdraw')

	await config.setMetricsFactory(nextMetricsFactory.address, {
		gasPrice: await fastest(),
		gas,
	})
	____log('updated AddressConfig for MetricsFactory')

	callback(null)
}

export = handler
