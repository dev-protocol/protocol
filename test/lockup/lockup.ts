import {DevProtocolInstance} from '../test-lib/instance'
import {MetricsInstance, PropertyInstance} from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import {mine, toBigNumber} from '../test-lib/utils/common'
import {getPropertyAddress, getMarketAddress} from '../test-lib/utils/log'
import {watch, waitForEvent, getEventValue} from '../test-lib/utils/event'
import {validateErrorMessage} from '../test-lib/utils/error'
import {WEB3_URI} from '../test-lib/const'

contract('LockupTest', ([deployer, user1]) => {
	const init = async (): Promise<
		[DevProtocolInstance, MetricsInstance, PropertyInstance]
	> => {
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
			dev.generateVoteCounter(),
			dev.generateVoteCounterStorage(),
			dev.generatePolicyFactory(),
			dev.generatePolicyGroup(),
			dev.generatePolicySet(),
			dev.generateDev(),
		])
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		const policy = await artifacts.require('PolicyTestForAllocator').new()

		await dev.policyFactory.create(policy.address)
		const propertyAddress = getPropertyAddress(
			await dev.propertyFactory.create('test', 'TEST', deployer)
		)
		const [property] = await Promise.all([
			artifacts.require('Property').at(propertyAddress),
		])
		const marketBehavior = await artifacts
			.require('MarketTest1')
			.new(dev.addressConfig.address)
		const marketAddress = getMarketAddress(
			await dev.marketFactory.create(marketBehavior.address)
		)
		const [market] = await Promise.all([
			artifacts.require('Market').at(marketAddress),
		])
		await market.authenticate(property.address, 'id1', '', '', '', '')
		const metricsAddress = await new Promise<string>((resolve) => {
			watch(dev.metricsFactory, WEB3_URI)('Create', (_, values) =>
				resolve(values._metrics)
			)
		})
		const [metrics] = await Promise.all([
			artifacts.require('Metrics').at(metricsAddress),
		])
		await dev.dev.addMinter(dev.lockup.address)
		return [dev, metrics, property]
	}

	const err = (error: Error): Error => error

	describe('Lockup; cancel', () => {
		it('An error occurs if you specify something other than a property address.', async () => {
			const [dev, ,] = await init()
			const res = await dev.lockup.cancel(user1).catch(err)
			validateErrorMessage(res, 'this is illegal address')
		})
		it('An error occurs when specifying a property address that is not locked up.', async () => {
			const [dev, , property] = await init()
			const res = await dev.lockup.cancel(property.address).catch(err)
			validateErrorMessage(res, 'dev token is not locked')
		})
		it('An error will occur if not locked up.', async () => {
			const [dev, , property] = await init()
			const res = await dev.lockup.cancel(property.address).catch(err)
			validateErrorMessage(res, 'dev token is not locked')
		})
		it('Cannot be canceled during cancellation.', async () => {
			const [dev, , property] = await init()
			await dev.dev.deposit(property.address, 10000)
			await dev.lockup.cancel(property.address)
			const res = await dev.lockup.cancel(property.address).catch(err)
			validateErrorMessage(res, 'lockup is already canceled')
		})
		it('If you stand for a certain time after canceling, withdraw ends normally.', async () => {
			const [dev, , property] = await init()
			await dev.dev.deposit(property.address, 10000)
			await dev.lockup.cancel(property.address)
			await mine(1)
			await dev.lockup.withdraw(property.address)
		})
		it('Cannot be canceled after withdraw ends normally.', async () => {
			const [dev, , property] = await init()
			await dev.dev.deposit(property.address, 10000)
			await dev.lockup.cancel(property.address)
			await mine(1)
			await dev.lockup.withdraw(property.address)
			const res = await dev.lockup.cancel(property.address).catch(err)
			validateErrorMessage(res, 'dev token is not locked')
		})
	})
	describe('Lockup; lockup', () => {
		it('should fail to call when paused', async () => {
			const [dev, , property] = await init()

			await dev.lockup.pause()

			const res = await dev.lockup
				.lockup(deployer, property.address, 10000)
				.catch(err)
			validateErrorMessage(res, 'You cannot use that')
		})
		it('should fail to call when sent from other than Dev Contract', async () => {
			const [dev, , property] = await init()

			const res = await dev.lockup
				.lockup(deployer, property.address, 10000)
				.catch(err)
			validateErrorMessage(res, 'this is illegal address')
		})
		it('should fail to call when passed address is not property contract', async () => {
			const [dev] = await init()

			const res = await dev.lockup.lockup(deployer, user1, 10000).catch(err)
			validateErrorMessage(res, 'this is illegal address')
		})
		it('should fail to call when lockup is canceling', async () => {
			const [dev, , property] = await init()

			await dev.addressConfig.setToken(deployer)
			await dev.addressConfig.setLockup(deployer)
			await dev.lockupStorage.setWithdrawalStatus(property.address, deployer, 1)
			await dev.addressConfig.setLockup(dev.lockup.address)

			const res = await dev.lockup
				.lockup(deployer, property.address, 10000)
				.catch(err)
			validateErrorMessage(res, 'lockup is already canceled')
		})
		it('should fail to call when a passed value is 0', async () => {
			const [dev, , property] = await init()

			await dev.addressConfig.setToken(deployer)
			await dev.addressConfig.setLockup(deployer)
			await dev.lockupStorage.setWithdrawalStatus(property.address, deployer, 1)
			await dev.addressConfig.setLockup(dev.lockup.address)

			const res = await dev.lockup
				.lockup(deployer, property.address, 0)
				.catch(err)
			validateErrorMessage(res, 'illegal lockup value')
		})
		it(`should fail to call when token's transfer was failed`, async () => {
			const [dev, , property] = await init()

			const res = await dev.dev
				.deposit(property.address, 10000, {from: user1})
				.catch(err)
			validateErrorMessage(res, 'ERC20: transfer amount exceeds balance')
		})
		it('record transferred token as a lockup', async () => {
			const [dev, , property] = await init()

			dev.dev.deposit(property.address, 10000).catch(err)
			await waitForEvent(dev.lockup, WEB3_URI)('Lockedup')

			const lockedupAmount = await dev.lockup
				.getValue(property.address, deployer)
				.then(toBigNumber)
			expect(lockedupAmount.toFixed()).to.be.equal('10000')
			const lockedupAllAmount = await dev.lockup.getAllValue().then(toBigNumber)
			expect(lockedupAllAmount.toFixed()).to.be.equal('10000')
		})
		it('emit an event that notifies token locked-up', async () => {
			const [dev, , property] = await init()

			dev.dev.deposit(property.address, 10000).catch(err)
			const [_from, _property, _value] = await Promise.all([
				getEventValue(dev.lockup, WEB3_URI)('Lockedup', '_from'),
				getEventValue(dev.lockup, WEB3_URI)('Lockedup', '_property'),
				getEventValue(dev.lockup, WEB3_URI)('Lockedup', '_value'),
			])

			expect(_from).to.be.equal(deployer)
			expect(_property).to.be.equal(property.address)
			expect(_value).to.be.equal('10000')
		})
	})
	describe('Lockup; withdraw', () => {
		it('should fail to call when passed address is not property contract', async () => {
			const [dev] = await init()

			const res = await dev.lockup.withdraw(deployer).catch(err)
			validateErrorMessage(res, 'this is illegal address')
		})
		it('should fail to call when waiting for released', async () => {
			const [dev, , property] = await init()

			const res = await dev.lockup.withdraw(property.address).catch(err)
			validateErrorMessage(res, 'waiting for release')
		})
		it('should fail to call when dev token is not locked', async () => {
			const [dev, , property] = await init()

			await dev.addressConfig.setLockup(deployer)
			await dev.lockupStorage.setWithdrawalStatus(property.address, deployer, 1)
			await dev.addressConfig.setLockup(dev.lockup.address)

			const res = await dev.lockup.withdraw(property.address).catch(err)
			validateErrorMessage(res, 'dev token is not locked')
		})
		it(`withdrawing sender's withdrawable full amount`, async () => {
			const [dev, , property] = await init()
			const beforeBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			await dev.dev.deposit(property.address, 10000)
			let lockedupAllAmount = await dev.lockup.getAllValue().then(toBigNumber)
			expect(lockedupAllAmount.toFixed()).to.be.equal('10000')
			await dev.addressConfig.setLockup(deployer)
			await dev.lockupStorage.setWithdrawalStatus(property.address, deployer, 1)
			await dev.addressConfig.setLockup(dev.lockup.address)

			await dev.lockup.withdraw(property.address)
			lockedupAllAmount = await dev.lockup.getAllValue().then(toBigNumber)
			expect(lockedupAllAmount.toFixed()).to.be.equal('0')
			const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			expect(afterBalance.toFixed()).to.be.equal(beforeBalance.toFixed())
			expect(afterTotalSupply.toFixed()).to.be.equal(
				beforeTotalSupply.toFixed()
			)
		})
	})
	describe('Lockup; withdrawInterest', () => {
		it('should fail to call when passed address is not property contract', async () => {
			const [dev] = await init()

			const res = await dev.lockup.withdrawInterest(deployer).catch(err)
			validateErrorMessage(res, 'this is illegal address')
		})
		it(`should fail to call when hasn't withdrawable interest amount`, async () => {
			const [dev, , property] = await init()

			const res = await dev.lockup.withdrawInterest(property.address).catch(err)
			validateErrorMessage(res, 'your interest amount is 0')
		})
		describe('withdrawing interest amount', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance

			before(async () => {
				;[dev, , property] = await init()
				await dev.addressConfig.setToken(deployer)
				await dev.addressConfig.setAllocator(deployer)
				await dev.lockup.lockup(deployer, property.address, 10000)
				await dev.lockup.increment(property.address, 500000)
				await dev.addressConfig.setToken(dev.dev.address)
				await dev.addressConfig.setAllocator(dev.allocator.address)
				await dev.addressConfig.setLockup(deployer)
				await dev.lockupStorage.setWithdrawalStatus(
					property.address,
					deployer,
					1
				)
				await dev.addressConfig.setLockup(dev.lockup.address)
			})

			it(`withdrawing sender's withdrawable interest full amount`, async () => {
				const beforeBalance = await dev.dev
					.balanceOf(deployer)
					.then(toBigNumber)
				const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)
				const amount = await dev.lockup
					.calculateWithdrawableInterestAmount(property.address, deployer)
					.then(toBigNumber)

				await dev.lockup.withdrawInterest(property.address)

				const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

				expect(amount.toFixed()).to.be.equal('500000')
				expect(afterBalance.toFixed()).to.be.equal(
					beforeBalance.plus(amount).toFixed()
				)
				expect(afterTotalSupply.toFixed()).to.be.equal(
					beforeTotalSupply.plus(amount).toFixed()
				)
			})
			it('withdrawable interest amount becomes 0 when after withdrawing interest', async () => {
				const amount = await dev.lockup
					.calculateWithdrawableInterestAmount(property.address, deployer)
					.then(toBigNumber)
				expect(amount.toFixed()).to.be.equal('0')
			})
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
				await dev.addressConfig.setAllocator(deployer)
				await dev.dev.deposit(property.address, 10000, {from: alice})
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
			describe('after additional staking', () => {
				before(async () => {
					await dev.dev.deposit(property.address, 40000, {from: alice})
					await dev.lockup.increment(property.address, 2000000)
				})
				it(`Alice's withdrawable interest is 100% of the Property's interest`, async () => {
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					expect(aliceAmount.toFixed()).to.be.equal('10000000')
				})
			})
			describe('after withdrawal', () => {
				before(async () => {
					await dev.lockup.cancel(property.address, {from: alice})
					await dev.lockup.withdraw(property.address, {
						from: alice,
					})
				})
				it(`Alice's withdrawable interest is 100% of the Property's interest`, async () => {
					const aliceLockup = await dev.lockup
						.getValue(property.address, alice)
						.then(toBigNumber)
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					expect(aliceLockup.toFixed()).to.be.equal('0')
					expect(aliceAmount.toFixed()).to.be.equal('10000000')
				})
			})
		})

		describe('scenario: multiple lockup', () => {
			before(async () => {
				;[dev, , property] = await init()
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
				await dev.addressConfig.setAllocator(deployer)
				await dev.dev.deposit(property.address, 10000, {from: alice})
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
					await dev.dev.deposit(property.address, 10000 * 0.25, {from: bob})
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
						total.times(0.8).integerValue(BigNumber.ROUND_DOWN).toFixed()
					)
					expect(bobBalance.toFixed()).to.be.equal(
						total.times(0.2).integerValue(BigNumber.ROUND_DOWN).toFixed()
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
			describe('additional staking', () => {
				it(`Bob does staking 30% of the Property's total lockups, Bob's share become ${
					625000 / 16250
				}%, Alice's share become ${1000000 / 16250}%`, async () => {
					await dev.dev.deposit(property.address, 12500 * 0.3, {from: bob})
					const aliceBalance = await dev.lockup
						.getValue(property.address, alice)
						.then(toBigNumber)
					const bobBalance = await dev.lockup
						.getValue(property.address, bob)
						.then(toBigNumber)

					expect(10000).to.be.equal(
						new BigNumber(16250)
							.times(new BigNumber(10000).div(16250))
							.toNumber()
					)
					expect(aliceBalance.toFixed()).to.be.equal('10000')
					expect(6250).to.be.equal(
						new BigNumber(16250)
							.times(new BigNumber(6250).div(16250))
							.toNumber()
					)
					expect(bobBalance.toFixed()).to.be.equal('6250')
				})
			})
			describe('after additional staking', () => {
				before(async () => {
					await dev.lockup.increment(property.address, 3000000)
				})
				it(`Alice's withdrawable interest is 100% of 2 times ago interest and 80% of prev interest and ${
					1000000 / 16250
				}% of current interest`, async () => {
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)

					expect(aliceAmount.toNumber()).to.be.equal(
						~~(5000000 + 3000000 * 0.8 + 3000000 * (10000 / 16250))
					)
				})
				it(`Bob's withdrawable interest is 20% of prev interest and ${
					625000 / 16250
				}% of current interest`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)

					expect(bobAmount.toNumber()).to.be.equal(
						~~(3000000 * 0.2 + 3000000 * (6250 / 16250))
					)
				})
			})
			describe('after withdrawal', () => {
				before(async () => {
					await dev.lockup.cancel(property.address, {from: alice})
					await dev.lockup.cancel(property.address, {from: bob})
					await dev.lockup.withdraw(property.address, {
						from: alice,
					})
					await dev.lockup.withdraw(property.address, {
						from: bob,
					})
				})
				it(`Alice's withdrawable interest is 100% of 2 times ago interest and 80% of prev interest and ${
					1000000 / 16250
				}% of current interest`, async () => {
					const aliceLockup = await dev.lockup
						.getValue(property.address, alice)
						.then(toBigNumber)
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)

					expect(aliceLockup.toFixed()).to.be.equal('0')
					expect(aliceAmount.toNumber()).to.be.equal(
						~~(5000000 + 3000000 * 0.8 + 3000000 * (10000 / 16250))
					)
				})
				it(`Bob's withdrawable interest is 25% of prev interest and ${
					625000 / 16250
				}%% of current interest`, async () => {
					const bobLockup = await dev.lockup
						.getValue(property.address, bob)
						.then(toBigNumber)
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)

					expect(bobLockup.toFixed()).to.be.equal('0')
					expect(bobAmount.toNumber()).to.be.equal(
						~~(3000000 * 0.2 + 3000000 * (6250 / 16250))
					)
				})
			})
		})
	})
})
