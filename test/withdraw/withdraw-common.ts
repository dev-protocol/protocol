import { DevProtocolInstance } from '../test-lib/instance'
import {
	MetricsInstance,
	PropertyInstance,
	IPolicyInstance,
	MarketInstance,
} from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import { getPropertyAddress, getMarketAddress } from '../test-lib/utils/log'
import { getEventValue } from '../test-lib/utils/event'

export const init = async (
	deployer: string,
	user: string,
	generateWithdrawTest = false
): Promise<
	[
		DevProtocolInstance,
		MetricsInstance,
		PropertyInstance,
		IPolicyInstance,
		MarketInstance
	]
> => {
	const dev = new DevProtocolInstance(deployer)
	await dev.generateAddressConfig()
	await dev.generateDev()
	await dev.generateDevMinter()
	await dev.generateSTokenManager()
	await Promise.all([
		dev.generateAllocator(),
		dev.generateMarketFactory(),
		dev.generateMarketGroup(),
		dev.generateMetricsFactory(),
		dev.generateMetricsGroup(),
		dev.generateLockup(),
		dev.generatePropertyFactory(),
		dev.generatePropertyGroup(),
		dev.generatePolicyFactory(),
		dev.generatePolicyGroup(),
	])
	if (generateWithdrawTest) {
		await dev.generateWithdrawTest()
	} else {
		await dev.generateWithdraw()
	}

	await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
	await dev.dev.mint(user, new BigNumber(1e18).times(10000000))

	const policyAddress = await dev.generatePolicy('PolicyTestForWithdraw')
	// eslint-disable-next-line @typescript-eslint/await-thenable
	const policy = await artifacts
		.require('PolicyTestForWithdraw')
		.at(policyAddress)
	const propertyAddress = getPropertyAddress(
		await dev.propertyFactory.create('test', 'TEST', deployer)
	)
	const [property] = await Promise.all([
		artifacts.require('Property').at(propertyAddress),
	])
	await dev.metricsGroup.__setMetricsCountPerProperty(property.address, 1)
	const marketBehavior = await artifacts
		.require('MarketTest1')
		.new(dev.addressConfig.address)
	const marketAddress = getMarketAddress(
		await dev.marketFactory.create(marketBehavior.address)
	)
	await marketBehavior.setAssociatedMarket(marketAddress)
	const [market] = await Promise.all([
		artifacts.require('Market').at(marketAddress),
	])
	market
		.authenticate(property.address, 'id1', '', '', '', '')
		.catch(console.error)
	const metricsAddress = await (async () =>
		getEventValue(dev.metricsFactory)('Create', '_metrics'))()
	const [metrics] = await Promise.all([
		artifacts.require('Metrics').at(metricsAddress as string),
	])
	await dev.lockup.update()

	return [dev, metrics, property, policy, market]
}
