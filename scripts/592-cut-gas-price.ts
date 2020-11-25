import { config } from 'dotenv'
import { ethGasStationFetcher } from '@devprtcl/util-ts'
import { DevCommonInstance } from './lib/instance/common'
import { Lockup } from './lib/instance/lockup'

config()
const { CONFIG: configAddress, EGS_TOKEN: egsApiKey } = process.env

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey) {
		return
	}

	const gasFetcher = async () => 6721975
	const gasPriceFetcher = ethGasStationFetcher(egsApiKey)
	const dev = new DevCommonInstance(
		artifacts,
		configAddress,
		gasFetcher,
		gasPriceFetcher
	)
	await dev.prepare()

	// Lockup
	const lockup = new Lockup(dev)
	const lockupInstance = await lockup.load()
	const nextLockupInstance = await lockup.create()
	await lockup.changeOwner(lockupInstance, nextLockupInstance)
	await lockup.set(nextLockupInstance)

	callback(null)
}

export = handler
