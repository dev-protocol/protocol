/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable no-undef */
import {config} from 'dotenv'
import {createFastestGasPriceFetcher} from './lib/ethgas'
import {ethgas} from './lib/api'
import {DevCommonInstance} from './lib/instance/common'
import {Lockup} from './lib/instance/lockup'
import {Withdraw} from './lib/instance/withdraw'
import {WithdrawStorage} from './lib/instance/withdraw-storage'

config()
const {CONFIG: configAddress, EGS_TOKEN: egsApiKey} = process.env

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey) {
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

	// Deploy new Lockup
	const l = new Lockup(dev)
	const lInstance = await l.load()
	const nLInstance = await l.create()
	await l._remove_later_setStorage(lInstance, nLInstance) // DON'T CHANGE THE OWNER TO THIS INSTANCE until completed the migration process

	// Deploy MigrateLockup
	const mLInstance = await l._remove_later_createMigrateContract()
	await l.changeOwner(lInstance, mLInstance)
	await l.set(mLInstance)

	// Deploy new Withdraw
	const w = new Withdraw(dev)
	const wSInstance = await new WithdrawStorage(dev).load()
	const nWInstance = await w.create()
	await w._remove_later_setStorage(wSInstance, nWInstance) // DON'T CHANGE THE OWNER TO THIS INSTANCE until completed the migration process

	// Deploy MigrateLockup
	const mWInstance = await w._remove_later_createMigrateContract()
	await w.changeOwner(wSInstance, mWInstance)
	await w.set(mWInstance)

	callback(null)
}

export = handler
