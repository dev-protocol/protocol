/* eslint-disable no-undef */
const {CONFIG} = process.env
const {log: ____log} = console

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!CONFIG) {
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

	// Deploy new Lockup
	const nextLockup = await artifacts.require('Lockup').new(config.address)
	____log('Deployed the new Lockup', nextLockup.address)

	// Add minter
	await dev.addMinter(nextLockup.address)
	____log('Added next Lockup as a minter')

	const lockupStorageAddress = await lockup.getStorageAddress()
	____log('Got EternalStorage address that uses by Lockup')
	await nextLockup.setStorage(lockupStorageAddress)
	____log('Set EternalStorage address to the new Lockup')
	await lockup.changeOwner(nextLockup.address)
	____log('Delegate authority to the new Lockup')

	// Enable new Contract
	await config.setLockup(nextLockup.address)
	____log('Updated Lockup address')

	callback(null)
}

export = handler
