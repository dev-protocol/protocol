/* eslint-disable no-undef */
import {createFastestGasPriceFetcher} from './lib/ethgas'
import {ethgas} from './lib/api'
import {config} from 'dotenv'
import {DevCommonInstance} from './lib/instance/common'
import {Lockup} from './lib/instance/lockup'
import {PolicyFactory} from './lib/instance/policy-factory'

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

	const l = new Lockup(dev)
	const lCurrent = await l.load()
	const lNext = await l.create()
	await l.changeOwner(lCurrent, lNext)
	await l.set(lNext)

	const pf = new PolicyFactory(dev)
	const pfNext = await pf.create()
	await pf.set(pfNext)

	callback(null)
}

export = handler
