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

	const [withdrawStorage, dev] = await Promise.all([
		artifacts.require('WithdrawStorage').at(await config.withdrawStorage()),
		artifacts.require('Dev').at(await config.token()),
	])
	console.log(
		'Generated current WithdrawStorage contract',
		withdrawStorage.address
	)
	console.log('Generated current Dev contract', dev.address)

	const fastest = ethGasStationFetcher(EGS_TOKEN)

	// Deploy WithdrawMigration as a new Withdraw
	// const nextWithdraw = await artifacts
	// 	.require('WithdrawMigration')
	// 	.new(config.address, { gasPrice: await fastest(), gas })
	// 	.catch(console.error)
	// if (!nextWithdraw) {
	// 	return
	// }

	// console.log('Deployed the new Withdraw', nextWithdraw.address)

	// Deploy new WithdrawStorage
	const nextWithdrawStorage = await artifacts
		.require('WithdrawStorage')
		.new({ gasPrice: await fastest(), gas })
	console.log('Deployed the new WithdrawStorage', nextWithdrawStorage.address)

	// Add minter
	// await dev
	// 	.addMinter(nextWithdraw.address, { gasPrice: await fastest(), gas })
	// 	.catch(console.error)
	// console.log('Added next Withdraw as a minter')

	// Delegate storage for WithdrawStorage
	const withdrawStorageAddress = await withdrawStorage.getStorageAddress()
	console.log('Got EternalStorage address that uses by WithdrawStorage')
	await nextWithdrawStorage
		.setStorage(withdrawStorageAddress, {
			gasPrice: await fastest(),
			gas,
		})
		.catch(console.error)
	if (!nextWithdrawStorage) {
		return
	}

	console.log('Set EternalStorage address to the new WithdrawStorage')

	// Activation
	await withdrawStorage
		.changeOwner(nextWithdrawStorage.address, {
			gasPrice: await fastest(),
			gas,
		})
		.catch(console.error)
	console.log('Delegated EternalStorage owner to the new WithdrawStorage')

	await config
		.setWithdrawStorage(nextWithdrawStorage.address, {
			gasPrice: await fastest(),
			gas,
		})
		.catch(console.error)
	console.log('updated AddressConfig for WithdrawStorage')

	// Await config
	// 	.setWithdraw(nextWithdraw.address, {
	// 		gasPrice: await fastest(),
	// 		gas,
	// 	})
	// 	.catch(console.error)
	// console.log('updated AddressConfig for Withdraw')

	callback(undefined)
}

export = handler
