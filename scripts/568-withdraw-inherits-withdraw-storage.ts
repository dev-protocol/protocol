/* eslint-disable no-undef */
import {createFastestGasPriceFetcher} from './lib/ethgas'
import {ethgas} from './lib/api'

const {CONFIG, EGS_TOKEN} = process.env
const {log: ____log} = console
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

	const [withdrawStorage, dev] = await Promise.all([
		artifacts.require('WithdrawStorage').at(await config.withdrawStorage()),
		artifacts.require('Dev').at(await config.token()),
	])
	____log('Generated current WithdrawStorage contract', withdrawStorage.address)
	____log('Generated current Dev contract', dev.address)

	const fastest = createFastestGasPriceFetcher(ethgas(EGS_TOKEN), web3)

	// Deploy new Withdraw
	const nextWithdraw = await artifacts
		.require('Withdraw')
		.new(config.address, {gasPrice: await fastest(), gas})
	____log('Deployed the new Withdraw', nextWithdraw.address)

	// Add minter
	await dev.addMinter(nextWithdraw.address, {gasPrice: await fastest(), gas})
	____log('Added next Withdraw as a minter')

	// Delegate storage for WithdrawStorage
	const withdrawStorageAddress = await withdrawStorage.getStorageAddress()
	____log('Got EternalStorage address that uses by WithdrawStorage')
	await nextWithdraw.setStorage(withdrawStorageAddress, {
		gasPrice: await fastest(),
		gas,
	})
	____log('Set EternalStorage address to the new Withdraw')

	// Activation
	await withdrawStorage.changeOwner(nextWithdraw.address, {
		gasPrice: await fastest(),
		gas,
	})
	____log('Delegated EternalStorage owner to the new Withdraw')

	await config.setWithdraw(nextWithdraw.address, {
		gasPrice: await fastest(),
		gas,
	})
	____log('updated AddressConfig for Withdraw')

	await config.setWithdrawStorage(
		'0x0000000000000000000000000000000000000000',
		{
			gasPrice: await fastest(),
			gas,
		}
	)
	____log('updated AddressConfig for WithdrawStorage')

	callback(null)
}

export = handler
