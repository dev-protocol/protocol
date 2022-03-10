import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { config } from 'dotenv'
import { DevCommonInstance } from './lib/instance/common'
import { MarketFactry } from './lib/instance/market-factory'
import { MarketGroup } from './lib/instance/market-group'

config()
const { CONFIG: configAddress, EGS_TOKEN: egsApiKey } = process.env

const handler = async (
	callback: (err: Error | undefined) => void
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

	// MarketGroup
	const mg = new MarketGroup(dev)
	const mgCurrent = await mg.load()
	const mgNext = await mg.create()
	await mg.changeOwner(mgCurrent, mgNext)
	await mg.set(mgNext)

	callback(undefined)
}

export = handler
