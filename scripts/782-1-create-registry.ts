import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { config } from 'dotenv'
import { DevCommonInstance } from './lib/instance/common'

config()
const { CONFIG: configAddress, EGS_TOKEN: egsApiKey } = process.env

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey) {
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
	const registry = await artifacts.require('Registry').new(await dev.gasInfo)

	const allocatorAddress = await dev.addressConfig.allocator()
	await registry.set('Allocator', allocatorAddress, await dev.gasInfo)

	const lockupAddress = await dev.addressConfig.lockup()
	await registry.set('Lockup', lockupAddress, await dev.gasInfo)

	const marketFactoryAddress = await dev.addressConfig.marketFactory()
	await registry.set('MarketFactory', marketFactoryAddress, await dev.gasInfo)

	const marketGroupAddress = await dev.addressConfig.marketGroup()
	await registry.set('MarketGroup', marketGroupAddress, await dev.gasInfo)

	const metricsFactoryAddress = await dev.addressConfig.metricsFactory()
	await registry.set('MetricsFactory', metricsFactoryAddress, await dev.gasInfo)

	const metricsGroupAddress = await dev.addressConfig.metricsGroup()
	await registry.set('MetricsGroup', metricsGroupAddress, await dev.gasInfo)

	const policyAddress = await dev.addressConfig.policy()
	await registry.set('Policy', policyAddress, await dev.gasInfo)

	const policyFactoryAddress = await dev.addressConfig.policyFactory()
	await registry.set('PolicyFactory', policyFactoryAddress, await dev.gasInfo)

	const policyGroupAddress = await dev.addressConfig.policyGroup()
	await registry.set('PolicyGroup', policyGroupAddress, await dev.gasInfo)

	const propertyFactoryAddress = await dev.addressConfig.propertyFactory()
	await registry.set(
		'PropertyFactory',
		propertyFactoryAddress,
		await dev.gasInfo
	)

	const propertyGroupAddress = await dev.addressConfig.propertyGroup()
	await registry.set('PropertyGroup', propertyGroupAddress, await dev.gasInfo)

	const tokenAddress = await dev.addressConfig.token()
	await registry.set('Token', tokenAddress, await dev.gasInfo)

	const voteCounterAddress = await dev.addressConfig.voteCounter()
	await registry.set('VoteCounter', voteCounterAddress, await dev.gasInfo)

	const withdrawAddress = await dev.addressConfig.withdraw()
	await registry.set('Withdraw', withdrawAddress, await dev.gasInfo)

	callback(null)
}

export = handler
