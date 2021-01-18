import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { config } from 'dotenv'
import { DevCommonInstance } from './lib/instance/common'
import { MetricsGroup } from './lib/instance/metrics-group'

config()
const {
	CONFIG: configAddress,
	EGS_TOKEN: egsApiKey,
	TOTAL_AUTHENTICATE_PROPERTIES: totalAuthenticatedProperties,
} = process.env

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey || !totalAuthenticatedProperties) {
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

	const metricsGroup = new MetricsGroup(dev)
	const currentMetoricsGroup = await metricsGroup.load()
	const nextMetricsGroup = await metricsGroup.create()
	await metricsGroup.set(nextMetricsGroup)
	await metricsGroup.changeOwner(currentMetoricsGroup, nextMetricsGroup)
	await nextMetricsGroup.setTotalAuthenticatedPropertiesAdmin(
		totalAuthenticatedProperties
	)
	callback(null)
}

export = handler
