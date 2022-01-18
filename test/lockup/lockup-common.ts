import { DevProtocolInstance } from '../test-lib/instance'
import {
	PropertyInstance,
	PolicyTestBaseInstance,
} from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import { getPropertyAddress } from '../test-lib/utils/log'

export const err = (error: Error): Error => error

export const init = async (
	deployer: string,
	user: string,
	initialUpdate = true
): Promise<[DevProtocolInstance, PropertyInstance, PolicyTestBaseInstance]> => {
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
		dev.generateWithdraw(),
		dev.generatePropertyFactory(),
		dev.generatePropertyGroup(),
		dev.generatePolicyFactory(),
		dev.generatePolicyGroup(),
	])
	await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
	const policyAddress = await dev.generatePolicy('PolicyTestBase')
	// eslint-disable-next-line @typescript-eslint/await-thenable
	const policy = await artifacts.require('PolicyTestBase').at(policyAddress)
	const propertyAddress = getPropertyAddress(
		await dev.propertyFactory.create('test', 'TEST', user, {
			from: user,
		})
	)
	const [property] = await Promise.all([
		artifacts.require('Property').at(propertyAddress),
	])

	await dev.addressConfig.setMetricsFactory(deployer)
	await dev.metricsGroup.addGroup(
		(
			await dev.createMetrics(deployer, property.address)
		).address
	)

	if (initialUpdate) {
		await dev.lockup.update()
	}

	return [dev, property, policy]
}
