const CONFIG = '0x1D415aa39D647834786EB9B5a333A50e9935b796'
const DEPLOYED_BLOCK = '10358615'
const { log: ____log } = console

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	// Generate AddressConfig contract
	const [config] = await Promise.all([
		artifacts.require('AddressConfig').at(CONFIG),
	])
	____log('Generated AddressConfig contract', config.address)

	const [lockupStorage] = await Promise.all([
		artifacts.require('LockupStorage').at(await config.lockupStorage()),
	])
	____log('Generated LockupStorage contract', lockupStorage.address)

	// Deploy new Lockup and new Withdraw
	const nextLockup = await artifacts.require('Lockup').new(config.address)
	____log('Deployed the new Lockup', nextLockup.address)
	const nextWithdraw = await artifacts.require('Withdraw').new(config.address)
	____log('Deployed the new Withdraw', nextWithdraw.address)

	// Delegate authority
	const lockupStorageAddress = await lockupStorage.getStorageAddress()
	____log('Got EternalStorage address that uses by Lockup')
	await nextLockup.setStorage(lockupStorageAddress)
	____log('Set EternalStorage address to the new Lockup')
	await lockupStorage.changeOwner(nextLockup.address)
	____log('Delegate authority to the new Lockup')

	// Update DIP4GenesisBlock
	await nextLockup.setDIP4GenesisBlock(DEPLOYED_BLOCK)
	____log('Update DIP4GenesisBlock')

	// Enable new Lockup and new Withdraw
	await config.setLockup(nextLockup.address)
	____log('Update Lockup address')
	await config.setWithdraw(nextWithdraw.address)
	____log('Update Withdraw address')

	// Set Default Address
	await config.setAllocatorStorage('0x0000000000000000000000000000000000000000')
	____log('Reset AllocatorStorage address')
	await config.setLockupStorage('0x0000000000000000000000000000000000000000')
	____log('Reset LockupStorage address')

	callback(null)
}

export = handler
