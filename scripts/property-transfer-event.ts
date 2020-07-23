/* eslint-disable no-undef */
const CONFIG = '0x1D415aa39D647834786EB9B5a333A50e9935b796'
const {log: ____log} = console

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	// Generate current contract
	const [config] = await Promise.all([
		artifacts.require('AddressConfig').at(CONFIG),
	])
	____log('Generated AddressConfig contract', config.address)

	const [dev] = await Promise.all([
		artifacts.require('Dev').at(await config.token()),
	])

	// Deploy new Lockup and new Withdraw
	const nextWithdraw = await artifacts.require('Withdraw').new(config.address)
	____log('Deployed the new Withdraw', nextWithdraw.address)

	// Add minter
	await dev.addMinter(nextWithdraw.address)
	____log('Added next Lockup as a minter')

	// Enable new Contract
	await config.setWithdraw(nextWithdraw.address)
	____log('Update Withdraw address')

	callback(null)
}

export = handler
