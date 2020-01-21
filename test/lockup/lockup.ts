import {DevProtocolInstance} from '../test-lib/instance'
import {MetricsInstance, PropertyInstance} from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import {
	getPropertyAddress,
	getMarketAddress,
	watch,
	validateErrorMessage
} from '../test-lib/utils'
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
		await dev.dev.addMinter(dev.lockup.address)
		return [dev, metrics, property]
	}

	const toBigNumber = (v: string | BigNumber): BigNumber => new BigNumber(v)
	const err = (error: Error): Error => error

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
		it('should fail to call when passed address is not property contract', async () => {
			const [dev] = await init()

			const res = await dev.lockup.withdraw(deployer).catch(err)
			expect(res).to.be.an.instanceOf(Error)
			validateErrorMessage(res as Error, 'this address is not proper')
		})
		it('should fail to call when waiting for released', async () => {
			const [dev, , property] = await init()

			const res = await dev.lockup.withdraw(property.address).catch(err)
			expect(res).to.be.an.instanceOf(Error)
			validateErrorMessage(res as Error, 'waiting for release')
		})
		it('should fail to call when dev token is not locked', async () => {
			const [dev, , property] = await init()

			await dev.addressConfig.setLockup(deployer)
			await dev.lockupStorage.setWithdrawalStatus(property.address, deployer, 1)
			await dev.addressConfig.setLockup(dev.lockup.address)

			const res = await dev.lockup.withdraw(property.address).catch(err)
			expect(res).to.be.an.instanceOf(Error)
			validateErrorMessage(res as Error, 'dev token is not locked')
		})
		it(`withdrawing sender's withdrawable full amount`, async () => {
			const [dev, , property] = await init()
			const beforeBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			await dev.addressConfig.setToken(deployer)
			await dev.lockup.lockup(deployer, property.address, 10000)
			await dev.addressConfig.setLockup(deployer)
			await dev.lockupStorage.setWithdrawalStatus(property.address, deployer, 1)
			await dev.addressConfig.setLockup(dev.lockup.address)

			await dev.lockup.withdraw(property.address)

			const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			expect(afterBalance.toFixed()).to.be.equal(beforeBalance.toFixed())
			expect(afterTotalSupply.toFixed()).to.be.equal(
				beforeTotalSupply.toFixed()
			)
		})
	})
	describe('Lockup: increment', () => {
		let dev: DevProtocolInstance
		let property: PropertyInstance
		const alice = deployer
		const bob = user1

		it('should fail to increment when sent from other than Allocator Contract', async () => {
			;[dev, , property] = await init()
			const res = await dev.lockup
				.increment(property.address, 5000000)
				.catch((err: Error) => err)
			expect(res).to.be.an.instanceOf(Error)
		})

		describe('scenario; single lockup', () => {
			before(async () => {
				;[dev, , property] = await init()
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
				await dev.addressConfig.setToken(deployer)
				await dev.addressConfig.setAllocator(deployer)
				await dev.lockup.lockup(alice, property.address, 10000)
				await dev.lockup.increment(property.address, 5000000)
			})
			describe('before second allocation', () => {
				it(`Alice does staking 100% of the Property's total lockups`, async () => {
					const total = await dev.lockup
						.getPropertyValue(property.address)
						.then(toBigNumber)
					const aliceBalance = await dev.lockup
						.getValue(property.address, alice)
						.then(toBigNumber)
					expect(aliceBalance.toFixed()).to.be.equal(total.toFixed())
				})
				it(`Alice's withdrawable interest is 100% of the Property's interest`, async () => {
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					expect(aliceAmount.toFixed()).to.be.equal('5000000')
				})
			})
			describe('after second allocation', () => {
				before(async () => {
					await dev.lockup.increment(property.address, 3000000)
				})
				it(`Alice's withdrawable interest is 100% of the Property's interest`, async () => {
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					expect(aliceAmount.toFixed()).to.be.equal('8000000')
				})
			})
		})

		describe('scenario: multiple lockup', () => {
			before(async () => {
				;[dev, , property] = await init()
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
				await dev.addressConfig.setToken(deployer)
				await dev.addressConfig.setAllocator(deployer)
				await dev.lockup.lockup(alice, property.address, 10000)
				await dev.lockup.increment(property.address, 5000000)
			})
			describe('before second allocation', () => {
				it(`Alice does staking 100% of the Property's total lockups`, async () => {
					const total = await dev.lockup
						.getPropertyValue(property.address)
						.then(toBigNumber)
					const aliceBalance = await dev.lockup
						.getValue(property.address, alice)
						.then(toBigNumber)
					expect(aliceBalance.toFixed()).to.be.equal(total.toFixed())
				})
				it(`Bob does staking 25% of the Property's total lockups, Alice's share become 80%`, async () => {
					await dev.lockup.lockup(bob, property.address, 10000 * 0.25)
					const total = await dev.lockup
						.getPropertyValue(property.address)
						.then(toBigNumber)
					const aliceBalance = await dev.lockup
						.getValue(property.address, alice)
						.then(toBigNumber)
					const bobBalance = await dev.lockup
						.getValue(property.address, bob)
						.then(toBigNumber)

					expect(aliceBalance.toFixed()).to.be.equal(
						total
							.times(0.8)
							.integerValue(BigNumber.ROUND_DOWN)
							.toFixed()
					)
					expect(bobBalance.toFixed()).to.be.equal(
						total
							.times(0.2)
							.integerValue(BigNumber.ROUND_DOWN)
							.toFixed()
					)
				})
				it(`Alice's withdrawable interest is 100% of the Property's interest`, async () => {
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					expect(aliceAmount.toFixed()).to.be.equal('5000000')
				})
				it(`Bob's withdrawable interest is 0 yet`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)
					expect(bobAmount.toFixed()).to.be.equal('0')
				})
			})
			describe('after second allocation', () => {
				before(async () => {
					await dev.lockup.increment(property.address, 3000000)
				})
				it(`Alice's withdrawable interest is 100% of prev interest and 80% of current interest`, async () => {
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)

					expect(aliceAmount.toNumber()).to.be.equal(5000000 + 3000000 * 0.8)
				})
				it(`Bob's withdrawable interest is 25% of current interest`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)

					expect(bobAmount.toNumber()).to.be.equal(3000000 * 0.2)
				})
			})
		})
	})
})
