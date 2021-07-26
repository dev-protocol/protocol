import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { config } from 'dotenv'
import { DevCommonInstance } from './lib/instance/common'
import { MarketFactry } from './lib/instance/market-factory'
import { PolicyFactory } from './lib/instance/policy-factory'
import { PolicyGroup } from './lib/instance/policy-group'

config()
const { CONFIG: configAddress, EGS_TOKEN: egsApiKey } = process.env

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey) {
		return
	}

	const gasFetcher = async () => 4000000
	const gasPriceFetcher = ethGasStationFetcher(egsApiKey)
	const dev = new DevCommonInstance(
		artifacts,
		configAddress,
		gasFetcher,
		gasPriceFetcher
	)
	await dev.prepare()

	// MarketFactory
	const mf = new MarketFactry(dev)
	const mfNext = await mf.create()
	await mf.set(mfNext)

	// PolicyFactory
	const pf = new PolicyFactory(dev)
	const pfNext = await pf.create()
	await pf.set(pfNext)

	// PolicyGroup
	const pg = new PolicyGroup(dev)
	const pgCurrent = await pg.load()
	const pgNext = await pg.create()
	await pg.changeOwner(pgCurrent, pgNext)
	await pg.set(pgNext)

	await dev.addressConfig.setVoteCounter(
		'0x0000000000000000000000000000000000000000'
	)

	callback(null)
}

export = handler
