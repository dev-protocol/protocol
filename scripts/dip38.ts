import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { config } from 'dotenv'
import { DevCommonInstance } from './lib/instance/common'
import { MetricsGroup } from './lib/instance/metrics-group'
import { Lockup } from './lib/instance/lockup'
import { Withdraw } from './lib/instance/withdraw'
import { PolicyFactory } from './lib/instance/policy-factory'
import { Policy } from './lib/instance/policy'

config()
const {
	CONFIG: configAddress,
	EGS_TOKEN: egsApiKey,
	TOTAL_AUTHENTICATE_PROPERTIES: totalAuthenticatedProperties,
	GEOMETRIC_MEAN_SETTER: geometricMearSetter,
} = process.env

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (
		!configAddress ||
		!egsApiKey ||
		!totalAuthenticatedProperties ||
		!geometricMearSetter
	) {
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

	const policy = new Policy(dev)
	const currentPolicy = await policy.load()
	const treasuryAddress = await currentPolicy.treasury()
	const nextPolicy = await artifacts
		.require('GeometricMean')
		.new(dev.addressConfig.address)
	await nextPolicy.setGeometricMeanSetter(geometricMearSetter)
	await nextPolicy.setTreasury(treasuryAddress)

	const policyFactory = new PolicyFactory(dev)
	const currentPolicyFactory = await policyFactory.load()
	await currentPolicyFactory.create(nextPolicy.address)

	const metricsGroup = new MetricsGroup(dev)
	const currentMetoricsGroup = await metricsGroup.load()
	const nextMetricsGroup = await metricsGroup.create()
	await metricsGroup.set(nextMetricsGroup)
	await metricsGroup.changeOwner(currentMetoricsGroup, nextMetricsGroup)
	await nextMetricsGroup.setTotalAuthenticatedPropertiesAdmin(
		totalAuthenticatedProperties
	)
	const lockup = new Lockup(dev)
	const currentLockup = await lockup.load()
	const nextLockupp = await lockup.create()
	await lockup.set(nextLockupp)
	await lockup.changeOwner(currentLockup, nextLockupp)

	const withdraw = new Withdraw(dev)
	const currentWithdraw = await withdraw.load()
	const nextWithdraw = await withdraw.create()
	await withdraw.set(nextWithdraw)
	await withdraw.changeOwner(currentWithdraw, nextWithdraw)

	callback(null)
}

export = handler
