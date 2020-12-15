import { config } from 'dotenv'
import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { DevCommonInstance } from './lib/instance/common'
import { Withdraw } from './lib/instance/withdraw'
import { WithdrawStorage } from './lib/instance/withdraw-storage'

config()
const { CONFIG: configAddress, EGS_TOKEN: egsApiKey } = process.env

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey) {
		return
	}

	const gasFetcher = async () => 6721975
	const fastest = ethGasStationFetcher(egsApiKey)
	const dev = new DevCommonInstance(
		artifacts,
		configAddress,
		gasFetcher,
		fastest
	)
	await dev.prepare()

	// Withdraw
	const withdraw = new Withdraw(dev)
	const nextWithdrawInstance = await withdraw.create()

	// WithdrawStorage
	const withdrawStorage = new WithdrawStorage(dev)
	const withdrawStorageInstance = await withdrawStorage.load()
	const withdrawStorageAddress = await withdrawStorageInstance.getStorageAddress()
	console.log(`withdraw storage address is ${withdrawStorageAddress}`)

	await nextWithdrawInstance.setStorage(withdrawStorageAddress, {
		gasPrice: await fastest(),
		gas: await gasFetcher(),
	})
	await withdrawStorageInstance.changeOwner(nextWithdrawInstance.address, {
		gasPrice: await fastest(),
		gas: await gasFetcher(),
	})
	console.log(
		`change owner from ${withdrawStorageInstance.address} to ${nextWithdrawInstance.address}`
	)

	await withdraw.set(nextWithdrawInstance)
	await dev.addressConfig.setWithdrawStorage(
		'0x0000000000000000000000000000000000000000',
		{
			gasPrice: await fastest(),
			gas: await gasFetcher(),
		}
	)
	console.log('WithdrawStorage address is 0')

	callback(null)
}

export = handler
