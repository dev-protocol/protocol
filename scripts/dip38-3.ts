import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { config } from 'dotenv'
import { DevCommonInstance } from './lib/instance/common'
import { MetricsGroup } from './lib/instance/metrics-group'
import { Lockup } from './lib/instance/lockup'
import { LockupMigration } from './lib/instance/lockup-migration'

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
	await currentMetoricsGroup.setTotalAuthenticatedPropertiesAdmin(
		totalAuthenticatedProperties
	)

	const lockupMigration = new LockupMigration(dev)
	const currentLockup = await lockupMigration.load()
	const lockup = new Lockup(dev)
	const nextLockup = await lockup.create()
	await lockup.set(nextLockup)
	await lockupMigration.changeOwner(currentLockup, nextLockup)

	callback(null)
}

export = handler

// TODO
// 最終的にこのスクリプトでいいのか確認する
