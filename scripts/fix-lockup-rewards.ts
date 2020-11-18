import { createFastestGasPriceFetcher } from './lib/ethgas'
import { ethgas } from './lib/api'

/* eslint-disable no-undef */
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

	const [lockup, dev] = await Promise.all([
		artifacts.require('Lockup').at(await config.lockup()),
		artifacts.require('Dev').at(await config.token()),
	])
	____log('Generated current Lockup contract', lockup.address)
	____log('Generated current Dev contract', dev.address)

	const fastest = createFastestGasPriceFetcher(ethgas(EGS_TOKEN), web3)

	// Deploy new Lockup
	const nextLockup = await artifacts
		.require('Lockup')
		.new(config.address, { gasPrice: await fastest(), gas })
	____log('Deployed the new Lockup', nextLockup.address)

	// Add minter
	await dev.addMinter(nextLockup.address, { gasPrice: await fastest(), gas })
	____log('Added next Lockup as a minter')

	const lockupStorageAddress = await lockup.getStorageAddress()
	____log('Got EternalStorage address that uses by Lockup')
	await nextLockup.setStorage(lockupStorageAddress, {
		gasPrice: await fastest(),
		gas,
	})
	____log('Set EternalStorage address to the new Lockup')

	await lockup.changeOwner(nextLockup.address, {
		gasPrice: await fastest(),
		gas,
	})
	____log('Delegated EternalStorage owner to the new Lockup')

	await config.setLockup(nextLockup.address, { gasPrice: await fastest(), gas })
	____log('updated AddressConfig')

	callback(null)
}

export = handler
