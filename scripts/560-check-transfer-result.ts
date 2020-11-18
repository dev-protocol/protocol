/* eslint-disable no-undef */
import { createFastestGasPriceFetcher } from './lib/ethgas'
import { ethgas } from './lib/api'
import { config } from 'dotenv'
import { DevCommonInstance } from './lib/instance/common'
import { PropertyFactory } from './lib/instance/property-factory'

config()
const { CONFIG: configAddress, EGS_TOKEN: egsApiKey } = process.env

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

	const propertyFactory = new PropertyFactory(dev)
	const nextPropertyFactory = await propertyFactory.create()
	await propertyFactory.set(nextPropertyFactory)
	callback(null)
}

export = handler
