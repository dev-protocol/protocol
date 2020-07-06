/* eslint-disable no-undef */
const CONFIG = '0x1D415aa39D647834786EB9B5a333A50e9935b796'
const DEPLOYED_BLOCK = '10358615'

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	// Generate AddressConfig contract
	const [config] = await Promise.all([
		artifacts.require('AddressConfig').at(CONFIG),
	])
	// Generate current Lockup contract and Withdraw contract
	const [oldLockup, oldWithdraw] = await Promise.all([
		artifacts.require('Lockup').at(await config.lockup()),
		artifacts.require('Withdraw').at(await config.withdraw()),
	])

	const [lockupStorage] = await Promise.all([
		artifacts.require('LockupStorage').at(await config.lockupStorage()),
	])

	// Deploy new Lockup and new Withdraw
	const nextLockup = await artifacts.require('Lockup').new(config.address)
	const nextWithdraw = await artifacts.require('Withdraw').new(config.address)

	// Update DIP4GenesisBlock
	await nextLockup.setDIP4GenesisBlock(DEPLOYED_BLOCK)

	// Delegation of authority
	const lockupStorageAddress = await lockupStorage.getStorageAddress()
	await nextLockup.setStorage(lockupStorageAddress)
	await lockupStorage.changeOwner(nextLockup.address)

	// Pause current Lockup contract and Withdraw contract
	await oldLockup.pause()
	await oldWithdraw.pause()

	// Enable new Lockup and new Withdraw
	await config.setLockup(nextLockup.address)
	await config.setWithdraw(nextWithdraw.address)

	// Set Default Address
	await config.setAllocatorStorage('0x0000000000000000000000000000000000000000')
	await config.setLockupStorage('0x0000000000000000000000000000000000000000')

	callback(null)
}

export = handler
