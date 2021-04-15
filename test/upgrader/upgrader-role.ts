import { DevProtocolInstance } from '../test-lib/instance'
import BigNumber from 'bignumber.js'
import { toBigNumber } from '../test-lib/utils/common'
import { PropertyInstance } from '../../types/truffle-contracts'
import { getPropertyAddress, getMarketAddress } from '../test-lib/utils/log'
import { validateAddressErrorMessage } from '../test-lib/utils/error'

contract('UpgraderRole', ([deployer, user1]) => {
	// Const marketContract = artifacts.require('Market')
	// const init = async (): Promise<[DevProtocolInstance, PropertyInstance]> => {
	// 	const dev = new DevProtocolInstance(deployer)
	// 	await dev.generateAddressConfig()
	// 	await dev.generateDev()
	// 	await dev.generateDevMinter()
	// 	await Promise.all([
	// 		dev.generateAllocator(),
	// 		dev.generateMarketFactory(),
	// 		dev.generateMarketGroup(),
	// 		dev.generateMetricsFactory(),
	// 		dev.generateMetricsGroup(),
	// 		dev.generateLockup(),
	// 		dev.generateWithdraw(),
	// 		dev.generatePropertyFactory(),
	// 		dev.generatePropertyGroup(),
	// 		dev.generateVoteCounter(),
	// 		dev.generatePolicyFactory(),
	// 		dev.generatePolicyGroup(),
	// 	])

	// 	await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
	// 	await dev.generatePolicy('PolicyTestForAllocator')
	// 	const propertyAddress = getPropertyAddress(
	// 		await dev.propertyFactory.create('test', 'TEST', deployer)
	// 	)
	// 	const [property] = await Promise.all([
	// 		artifacts.require('Property').at(propertyAddress),
	// 	])
	// 	await dev.metricsGroup.__setMetricsCountPerProperty(property.address, 1)
	// 	return [dev, property]
	// }

	// const authenticate = async (
	// 	dev: DevProtocolInstance,
	// 	propertyAddress: string
	// ): Promise<void> => {
	// 	const behavuor = await dev.getMarket('MarketTest3', user1)
	// 	let createMarketResult = await dev.marketFactory.create(behavuor.address)
	// 	const marketAddress = getMarketAddress(createMarketResult)
	// 	// eslint-disable-next-line @typescript-eslint/await-thenable
	// 	const marketInstance = await marketContract.at(marketAddress)
	// 	await (behavuor as any).setAssociatedMarket(marketAddress, {
	// 		from: user1,
	// 	})
	// 	await marketInstance.authenticate(
	// 		propertyAddress,
	// 		'id-key',
	// 		'',
	// 		'',
	// 		'',
	// 		'',
	// 		{ from: deployer }
	// 	)
	// }

	describe('constructor', () => {
		it('The deployer gets admin privileges.', async () => {
			const upgraderRole = await artifacts.require('UpgraderRole').new()
			let hasAdmin = await upgraderRole.hasAdmin(deployer)
			expect(hasAdmin).to.be.equal(true)
			hasAdmin = await upgraderRole.hasAdmin(user1)
			expect(hasAdmin).to.be.equal(false)
		})
	})

	describe('addAdmin', () => {
		it('The deployer gets admin privileges..', async () => {
			const upgraderRole = await artifacts.require('UpgraderRole').new()
			hasAdmin = await upgraderRole.hasAdmin(user1)
			expect(hasAdmin).to.be.equal(false)
		})
	})
})
