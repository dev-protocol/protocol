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
	NEXT_LOCKUP,
	NEXT_WITHDRAW,
} = process.env

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey || !NEXT_LOCKUP || !NEXT_WITHDRAW) {
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

	// Set new Lockup
	const l = new Lockup(dev)
	const nLInstance = await artifacts.require('Lockup').at(NEXT_LOCKUP)
	await l.set(nLInstance)

	// Set new Withdraw
	const w = new Withdraw(dev)
	const nWInstance = await artifacts.require('Withdraw').at(NEXT_WITHDRAW)
	await w.set(nWInstance)

	callback(null)
}

export = handler
