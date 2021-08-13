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

	const [dev] = await Promise.all([
		artifacts.require('Dev').at(await config.token()),
	])
	____log('Generated current Dev contract', dev.address)

	const fastest = ethGasStationFetcher(EGS_TOKEN)

	// Deploy new Withdraw
	const nextWithdraw = await artifacts
		.require('Withdraw')
		.new(config.address, DEV_MINTER, { gasPrice: await fastest(), gas })
		.catch(console.error)
	if (!nextWithdraw) {
		return
	}

	____log('Deployed the new Withdraw', nextWithdraw.address)

	// Add minter
	await dev
		.addMinter(nextWithdraw.address, { gasPrice: await fastest(), gas })
		.catch(console.error)
	____log('Added next Withdraw as a minter')

	// Activation
	await config
		.setWithdraw(nextWithdraw.address, {
			gasPrice: await fastest(),
			gas,
		})
		.catch(console.error)
	____log('updated AddressConfig for Withdraw')

	callback(null)
}

export = handler
