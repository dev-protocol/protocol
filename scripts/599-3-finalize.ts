/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable no-undef */
import {config} from 'dotenv'
import {createFastestGasPriceFetcher} from './lib/ethgas'
import {ethgas} from './lib/api'
import {DevCommonInstance} from './lib/instance/common'
import {Lockup} from './lib/instance/lockup'
import {Withdraw} from './lib/instance/withdraw'

config()
const {
	CONFIG: configAddress,
	EGS_TOKEN: egsApiKey,
	MIGRATE_LOCKUP,
	MIGRATE_WITHDRAW,
} = process.env

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey || !MIGRATE_LOCKUP || !MIGRATE_WITHDRAW) {
		return
	}

	const gasFetcher = async () => 6721975
	const gasPriceFetcher = createFastestGasPriceFetcher(ethgas(egsApiKey), web3)
	const dev = new DevCommonInstance(
		artifacts,
		configAddress,
		gasFetcher,
		gasPriceFetcher
	)
	await dev.prepare()

	// Delegate to the new Lockup
	const l = new Lockup(dev)
	const lInstance = await artifacts.require('Lockup').at(MIGRATE_LOCKUP)
	const nLInstance = await l.load()
	await l.changeOwner(lInstance, nLInstance)

	// Delegate to the new Withdraw
	const w = new Withdraw(dev)
	const wInstance = await artifacts.require('Withdraw').at(MIGRATE_WITHDRAW)
	const nWInstance = await w.load()
	await w.changeOwner(wInstance, nWInstance)

	callback(null)
}

export = handler
