import {DevProtocolInstance} from '../test-lib/instance'
import {
	MarketInstance,
	MetricsInstance,
	PropertyInstance
} from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import {getPropertyAddress, getMarketAddress, watch} from '../test-lib/utils'
const uri = 'ws://localhost:7545'

contract('LockupTest', ([deployer]) => {
	const init = async (): Promise<[
		DevProtocolInstance,
		MarketInstance,
		MetricsInstance,
		PropertyInstance
	]> => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await Promise.all([
			dev.generateAllocator(),
			dev.generateAllocatorStorage(),
			dev.generateMarketFactory(),
			dev.generateMarketGroup(),
			dev.generateMetricsFactory(),
			dev.generateMetricsGroup(),
			dev.generateLockup(),
			dev.generateLockupStorage(),
			dev.generateWithdraw(),
			dev.generateWithdrawStorage(),
			dev.generatePropertyFactory(),
			dev.generatePropertyGroup(),
			dev.generateVoteTimes(),
			dev.generateVoteTimesStorage(),
			dev.generatePolicyFactory(),
			dev.generatePolicyGroup(),
			dev.generatePolicySet(),
			dev.generateDev()
		])
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		const policy = await artifacts.require('PolicyTestForAllocator').new()

		await dev.policyFactory.create(policy.address)
		const propertyAddress = getPropertyAddress(
			await dev.propertyFactory.create('test', 'TEST', deployer)
		)
		const [property] = await Promise.all([
			artifacts.require('Property').at(propertyAddress)
		])
		const marketBehavior = await artifacts
			.require('MarketTest1')
			.new(dev.addressConfig.address)
		const marketAddress = getMarketAddress(
			await dev.marketFactory.create(marketBehavior.address)
		)
		const [market] = await Promise.all([
			artifacts.require('Market').at(marketAddress)
		])
		await market.authenticate(property.address, '', '', '', '', '')
		const metricsAddress = await new Promise<string>(resolve => {
			market.authenticate(property.address, '', '', '', '', '')
			watch(dev.metricsFactory, uri)('Create', (_, values) =>
				resolve(values._metrics)
			)
		})
		const [metrics] = await Promise.all([
			artifacts.require('Metrics').at(metricsAddress)
		])
		return [dev, market, metrics, property]
	}

	describe('Lockup; cancel', () => {
		// TODO
	})
	describe('Lockup; lockup', () => {
		it('address is not property contract')
		it('lockup is already canceled')
		it('insufficient balance')
		it('transfer was failed')
		it('success', async () => {
			const [dev, , , property] = await init()
			await dev.lockup.lockup(deployer, property.address, 100)
			// eslint-disable-next-line no-warning-comments
			// TODO assert
		})
	})
	describe('Lockup; withdraw', () => {
		it('address is not property contract')
		it('lockup is not canceled')
		it('waiting for release')
		it('dev token is not locked')
		it('success')
	})
	describe('Lockup: withdrawInterest', () => {
		it(`mints 0 DEV when sender's lockup is 0 DEV`)
		describe('scenario: single lockup', () => {
			// Should use the same Lockup instance each tests because this is a series of scenarios.
			it(`the sender locks up 500 DEV when the property's total lockup is 1000`)
			it(`the property increments interest 1000000`)
			it(
				`withdrawInterestmints mints ${(1000000 * 500) /
					(500 + 1000)} DEV to the sender`
			)
			it(`mints 0 DEV when after the withdrawal`)
		})
		describe('scenario: multiple lockup', () => {
			// Should use the same Lockup instance each tests because this is a series of scenarios.
			it(`the sender locks up 500 DEV when the property's total lockup is 1000`)
			it(`the property increments interest 1000000`)
			it(`the sender locks up 800 DEV`)
			it(`the property increments interest 2000000`)
			it(
				`withdrawInterestmints mints ${(() => {
					const firstPrice = 1000000 / (500 + 1000)
					const secondPrice = 2000000 / (800 + 500 + 1000)
					return firstPrice * 500 + (secondPrice - firstPrice) * 800
				})()} DEV to the sender`
			)
			it(`mints 0 DEV when after the withdrawal`)
		})
	})
})
