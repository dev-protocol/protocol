import {DevProtocolInstance} from '../test-lib/instance'
import {MetricsInstance, PropertyInstance} from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import {getPropertyAddress, getMarketAddress, watch} from '../test-lib/utils'
const uri = 'ws://localhost:7545'

contract('LockupTest', ([deployer, user1]) => {
	const init = async (): Promise<[
		DevProtocolInstance,
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
		return [dev, metrics, property]
	}

	const toBigNumber = (v: string | BigNumber): BigNumber => new BigNumber(v)

	describe('Lockup; cancel', () => {
		// TODO
	})
	describe('Lockup; lockup', () => {
		it('address is not property contract')
		it('lockup is already canceled')
		it('insufficient balance')
		it('transfer was failed')
		it('success', async () => {
			const [dev, , property] = await init()
			await dev.addressConfig.setToken(deployer)
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
		describe(`Lockup; Alice stakings 20% of the Property's total lockups after stakings 100% of the Property's total.`, () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let metrics: MetricsInstance
			const alice = deployer
			const bob = user1

			describe('scenario; single lockup', () => {
				before(async () => {
					;[dev, metrics, property] = await init()
					const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
					await dev.dev.mint(bob, aliceBalance)
					await dev.addressConfig.setToken(deployer)
					await dev.lockup.lockup(alice, property.address, 10000)
					await dev.allocator.allocate(metrics.address)
				})
				describe('before second allocation', () => {
					it(`Alice does staking 100% of the Property's total lockups`)
					it(`Alice's withdrawable interest is 100% of the Property's interest`)
				})
				describe('after second allocation', () => {
					it(`Alice's withdrawable interest is 100% of the Property's interest`)
					it(`mints 0 DEV when after the withdrawal`)
				})
			})

			describe('scenario: multiple lockup', () => {
				before(async () => {
					;[dev, metrics, property] = await init()
					const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
					await dev.dev.mint(bob, aliceBalance)
					await dev.addressConfig.setToken(deployer)
					await dev.lockup.lockup(alice, property.address, 10000)
					await dev.allocator.allocate(metrics.address)
				})
				describe('before second allocation', () => {
					it(`Alice does staking 100% of the Property's total lockups`)
					it(
						`Bob does staking 20% of the Property's total lockups, Alice's share become 80%`
					)
					it(`Alice's withdrawable interest is 100% of the Property's interest`)
					it(`Bob's withdrawable interest is 0 yet`)
				})
				describe('after second allocation', () => {
					it(
						`Alice's withdrawable interest is 100% of prev interest and 20% of current interest`
					)
					it(`Bob's withdrawable interest is 80% of current interest`)
					it(`mints 0 DEV when after the withdrawal`)
				})
			})
		})
	})
})
