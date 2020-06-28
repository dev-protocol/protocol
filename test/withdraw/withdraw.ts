/* eslint-disable @typescript-eslint/no-unused-vars */
import {DevProtocolInstance} from '../test-lib/instance'
import {
	MetricsInstance,
	PropertyInstance,
	PolicyInstance,
} from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import {mine, toBigNumber, getBlock} from '../test-lib/utils/common'
import {
	getWithdrawHolderAmount,
	getWithdrawHolderSplitAmount,
} from '../test-lib/utils/mint-amount'
import {
	getPropertyAddress,
	getMarketAddress,
	getPolicyAddress,
} from '../test-lib/utils/log'
import {getEventValue} from '../test-lib/utils/event'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
	validatePauseErrorMessage,
} from '../test-lib/utils/error'
import {WEB3_URI} from '../test-lib/const'

contract('WithdrawTest', ([deployer, user1, user2, user3]) => {
	const init = async (): Promise<
		[DevProtocolInstance, MetricsInstance, PropertyInstance, PolicyInstance]
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
		await dev.dev.mint(user3, new BigNumber(1e18).times(10000000))
		const policy = await artifacts.require('PolicyTestForWithdraw').new()

		const policyCreateResult = await dev.policyFactory.create(policy.address)
		const policyAddress = getPolicyAddress(policyCreateResult)
		// eslint-disable-next-line @typescript-eslint/await-thenable
		const policyInstance = await artifacts.require('Policy').at(policyAddress)
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
		const metricsAddress = await (async () => {
			return getEventValue(dev.metricsFactory, WEB3_URI)('Create', '_metrics')
		})()
		const [metrics] = await Promise.all([
			artifacts.require('Metrics').at(metricsAddress as string),
		])
		await dev.dev.addMinter(dev.withdraw.address)
		await dev.lockup.update()

		return [dev, metrics, property, policyInstance]
	}

	describe('Withdraw; withdraw', () => {
		it('should fail to call when passed address is not property contract', async () => {
			const [dev] = await init()

			const res = await dev.withdraw
				.withdraw(deployer)
				.catch((err: Error) => err)
			validateAddressErrorMessage(res)
		})
		it(`should fail to call when hasn't withdrawable amount`, async () => {
			const [dev, , property] = await init()
			const res = await dev.withdraw
				.withdraw(property.address, {from: user1})
				.catch((err: Error) => err)
			validateErrorMessage(res, 'withdraw value is 0')
		})
		describe('withdrawing interest amount', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let policy: PolicyInstance

			before(async () => {
				;[dev, , property, policy] = await init()
				await dev.dev.deposit(property.address, 10000)
			})

			it(`withdrawing sender's withdrawable interest full amount`, async () => {
				const beforeBalance = await dev.dev
					.balanceOf(deployer)
					.then(toBigNumber)
				const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)
				await mine(10)
				const amount = await dev.withdraw
					.calculateWithdrawableAmount(property.address, deployer)
					.then(toBigNumber)
				await dev.withdraw.withdraw(property.address)
				const realAmount = await getWithdrawHolderAmount(
					dev,
					amount,
					property.address
				)
				const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

				expect(afterBalance.toFixed()).to.be.equal(
					beforeBalance.plus(realAmount).toFixed()
				)
				expect(afterTotalSupply.toFixed()).to.be.equal(
					beforeTotalSupply.plus(realAmount).toFixed()
				)
			})
			it('withdrawable interest amount becomes 0 when after withdrawing interest', async () => {
				const amount = await dev.withdraw
					.calculateWithdrawableAmount(property.address, deployer)
					.then(toBigNumber)
				expect(amount.toFixed()).to.be.equal('0')
			})
		})
		describe('Withdraw; Withdraw is mint', () => {
			it('Withdraw mints an ERC20 token specified in the Address Config Contract', async () => {
				const [dev, , property] = await init()
				await dev.dev.deposit(property.address, 10000)
				const prev = await dev.dev.totalSupply().then(toBigNumber)
				const balance = await dev.dev.balanceOf(deployer).then(toBigNumber)

				await dev.withdraw.withdraw(property.address)

				const next = await dev.dev.totalSupply().then(toBigNumber)
				const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const gap = next.minus(prev)

				expect(prev.toString()).to.be.not.equal(next.toString())
				expect(balance.plus(gap).toString()).to.be.equal(
					afterBalance.toString()
				)
			})
		})

		describe('Withdraw; Withdrawable amount', () => {
			it('The withdrawable amount each holder is the number multiplied the balance of the price per Property Contract and the Property Contract of the sender', async () => {
				const [dev, , property] = await init()
				await dev.dev.deposit(property.address, 10000, {from: user3})
				const totalSupply = await property.totalSupply().then(toBigNumber)

				await property.transfer(user1, totalSupply.times(0.2), {
					from: deployer,
				})

				const oneBlockAmount = await dev.withdraw
					.calculateTotalWithdrawableAmount(property.address)
					.then(toBigNumber)
				await mine(1)
				const amount1 = await dev.withdraw
					.calculateWithdrawableAmount(property.address, deployer)
					.then(toBigNumber)
				const amount2 = await dev.withdraw
					.calculateWithdrawableAmount(property.address, user1)
					.then(toBigNumber)

				expect(
					oneBlockAmount
						.times(0.8)
						.plus(oneBlockAmount)
						.integerValue(BigNumber.ROUND_DOWN)
						.toFixed()
				).to.be.equal(amount1.toFixed())
				expect(
					oneBlockAmount.times(0.2).integerValue(BigNumber.ROUND_DOWN).toFixed()
				).to.be.equal(amount2.toFixed())
			})
			it('The withdrawal amount is always the full amount of the withdrawable amount', async () => {
				const [dev, , property] = await init()
				await dev.dev.deposit(property.address, 10000, {from: user3})
				const totalSupply = await property.totalSupply().then(toBigNumber)
				const prevBalance1 = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const prevBalance2 = await dev.dev.balanceOf(user1).then(toBigNumber)

				const rate = 0.2
				await property.transfer(user1, totalSupply.times(rate), {
					from: deployer,
				})

				const amount1 = await dev.withdraw
					.calculateWithdrawableAmount(property.address, deployer)
					.then(toBigNumber)
				await dev.withdraw.withdraw(property.address, {
					from: deployer,
				})
				const realAmount1 = await getWithdrawHolderSplitAmount(
					dev,
					amount1,
					property,
					deployer
				)
				const amount2 = await dev.withdraw
					.calculateWithdrawableAmount(property.address, user1)
					.then(toBigNumber)
				await dev.withdraw.withdraw(property.address, {from: user1})
				const realAmount2 = await getWithdrawHolderSplitAmount(
					dev,
					amount2,
					property,
					user1
				)
				const nextBalance1 = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const nextBalance2 = await dev.dev.balanceOf(user1).then(toBigNumber)
				expect(prevBalance1.plus(realAmount1).toFixed()).to.be.equal(
					nextBalance1.toFixed()
				)
				expect(prevBalance2.plus(realAmount2).toFixed()).to.be.equal(
					nextBalance2.toFixed()
				)
			})
			it('should fail to withdraw when the withdrawable amount is 0', async () => {
				const [dev, , property] = await init()
				const prevBalance = await dev.dev.balanceOf(user1).then(toBigNumber)

				const amount = await dev.withdraw
					.calculateWithdrawableAmount(property.address, user1)
					.then(toBigNumber)
				const res = await dev.withdraw
					.withdraw(property.address, {from: user1})
					.catch((err: Error) => err)
				const afterBalance = await dev.dev.balanceOf(user1).then(toBigNumber)

				expect(amount.toFixed()).to.be.equal('0')
				expect(prevBalance.toFixed()).to.be.equal(afterBalance.toFixed())
				validateErrorMessage(res, 'withdraw value is 0')
			})
		})
	})

	describe('Withdraw; beforeBalanceChange', () => {
		describe('Withdraw; Alice has sent 10% tokens to Bob after 20% tokens sent. Bob has increased from 10% tokens to 30% tokens.', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			const alice = deployer
			const bob = user1

			before(async () => {
				;[dev, , property] = await init()

				const totalSupply = await property.totalSupply().then(toBigNumber)
				await property.transfer(bob, totalSupply.times(0.2), {
					from: alice,
				})
				await property.transfer(bob, totalSupply.times(0.1), {
					from: alice,
				})
				await dev.dev.deposit(property.address, 10000, {from: user3})
				await mine(1)
			})

			describe('Withdraw; Before increment', () => {
				it(`Alice's withdrawable amount is 70% of reward`, async () => {
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const totalAmount = await dev.withdraw
						.calculateTotalWithdrawableAmount(property.address)
						.then(toBigNumber)
					expect(aliceAmount.toFixed()).to.be.equal(
						totalAmount.times(0.7).integerValue(BigNumber.ROUND_DOWN).toFixed()
					)
				})

				it(`Bob's withdrawable amount is 30% of reward`, async () => {
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, bob)
						.then(toBigNumber)
					const totalAmount = await dev.withdraw
						.calculateTotalWithdrawableAmount(property.address)
						.then(toBigNumber)
					expect(bobAmount.toFixed()).to.be.equal(
						totalAmount.times(0.3).integerValue(BigNumber.ROUND_DOWN).toFixed()
					)
				})
			})

			describe('Withdraw; After increment', () => {
				it(`Alice's withdrawable amount is 70% of rewardd`, async () => {
					await mine(1)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const totalAmount = await dev.withdraw
						.calculateTotalWithdrawableAmount(property.address)
						.then(toBigNumber)
					expect(aliceAmount.toFixed()).to.be.equal(
						totalAmount.times(0.7).integerValue(BigNumber.ROUND_DOWN).toFixed()
					)
				})

				it(`Bob's withdrawable amount is 30% of reward`, async () => {
					await mine(1)
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, bob)
						.then(toBigNumber)
					const totalAmount = await dev.withdraw
						.calculateTotalWithdrawableAmount(property.address)
						.then(toBigNumber)
					expect(bobAmount.toFixed()).to.be.equal(
						totalAmount.times(0.3).integerValue(BigNumber.ROUND_DOWN).toFixed()
					)
				})

				it('Become 0 withdrawable amount when after withdrawing', async () => {
					await dev.withdraw.withdraw(property.address, {from: alice})
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					await dev.withdraw.withdraw(property.address, {from: bob})
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, bob)
						.then(toBigNumber)

					expect(aliceAmount.toFixed()).to.be.equal('0')
					expect(bobAmount.toFixed()).to.be.equal('0')
				})
			})

			it('Should fail to call `beforeBalanceChange` when sent from other than Property Contract address', async () => {
				const res = await dev.withdraw
					.beforeBalanceChange(property.address, deployer, user1, {
						from: deployer,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(res)
			})
		})
	})
	describe('Withdraw; pause', () => {
		it('should fail to call when paused.', async () => {
			const [dev, , property] = await init()
			await dev.withdraw.pause()
			let res = await dev.withdraw
				.getRewardsAmount(property.address)
				.catch((err: Error) => err)
			validatePauseErrorMessage(res, false)
			await dev.withdraw.unpause()
			res = await dev.withdraw.getRewardsAmount(property.address)
			expect(res.toNumber()).to.be.equal(0)
		})
	})
	describe('Withdraw; calculateWithdrawableAmount', () => {
		type Calculator = (
			prop: PropertyInstance,
			account: string,
			debug?: boolean
		) => Promise<BigNumber>
		const createCalculator = (dev: DevProtocolInstance): Calculator => async (
			prop: PropertyInstance,
			account: string,
			debug = false
		): Promise<BigNumber> =>
			Promise.all([
				dev.withdrawStorage
					.getLastCumulativeGlobalHoldersPrice(prop.address, account)
					.then(async (x) =>
						dev.lockup.difference(prop.address, x).then((x) => x[2])
					),
				prop.balanceOf(account),
				dev.withdrawStorage.getPendingWithdrawal(prop.address, account),
				dev.withdrawStorage.getCumulativePrice(prop.address),
				dev.withdrawStorage.getLastWithdrawalPrice(prop.address, account),
			]).then((results) => {
				const [
					price,
					balanceOfUser,
					pending,
					legacyPrice,
					legacyLastPrice,
				] = results.map(toBigNumber)
				const value = price.times(balanceOfUser).div(1e36)
				const legacy = legacyPrice
					.minus(legacyLastPrice)
					.times(balanceOfUser)
					.div(1e18)
				const withdrawable = value.plus(pending).plus(legacy)
				const res = withdrawable.integerValue(BigNumber.ROUND_DOWN)
				if (debug) {
					console.log(results.map((x) => toBigNumber(x).toFixed()))
					console.log('value', value)
					console.log('legacy', legacy)
					console.log('withdrawable', withdrawable)
					console.log('res', res)
				}

				return res
			})

		describe('scenario; zero lockup', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance

			const alice = deployer
			const bob = user1

			before(async () => {
				;[dev, , property] = await init()
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
			})

			describe('When totally is 0', () => {
				it(`Alice's withdrawable reward is 0`, async () => {
					const total = await dev.lockup.getAllValue().then(toBigNumber)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					expect(total.toFixed()).to.be.equal('0')
					expect(aliceAmount.toFixed()).to.be.equal('0')
				})
			})
			describe('When Property1 is 0', () => {
				before(async () => {
					const [property2] = await Promise.all([
						artifacts
							.require('Property')
							.at(
								getPropertyAddress(
									await dev.propertyFactory.create('test2', 'TEST2', deployer)
								)
							),
					])
					await dev.dev.deposit(
						property2.address,
						toBigNumber(10000).times(1e18),
						{from: bob}
					)
				})

				it(`Alice's withdrawable reward is 0`, async () => {
					const total = await dev.lockup.getAllValue().then(toBigNumber)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					expect(total.toFixed()).to.be.equal(
						toBigNumber(10000).times(1e18).toFixed()
					)
					expect(aliceAmount.toFixed()).to.be.equal('0')
				})
			})
		})
		describe('scenario; single lockup', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let calc: Calculator

			const alice = deployer
			const carol = user2

			before(async () => {
				;[dev, , property] = await init()
				calc = createCalculator(dev)
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(carol, aliceBalance)
				await dev.dev.deposit(
					property.address,
					toBigNumber(10000).times(1e18),
					{from: carol}
				)
			})

			/*
			 * PolicyTestForAllocator returns 100 as rewards
			 * And holders share is 90%
			 */

			describe('before withdrawal', () => {
				it(`Property1 is locked-up 100% of all Property's locked-ups`, async () => {
					const total = await dev.lockup.getAllValue().then(toBigNumber)
					const property1 = await dev.lockup
						.getPropertyValue(property.address)
						.then(toBigNumber)
					expect(property1.toFixed()).to.be.equal(total.toFixed())
				})
				it(`Alice's withdrawable reward is 900% of Carol's withdrawable interest`, async () => {
					await mine(9)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const expected = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, carol)
						.then((x) => toBigNumber(x).div(0.1).times(0.9))
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after withdrawal', () => {
				before(async () => {
					await dev.withdraw.withdraw(property.address, {from: alice})
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const expected = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after additional staking', () => {
				before(async () => {
					await dev.dev.deposit(
						property.address,
						toBigNumber(10000).times(1e18),
						{from: carol}
					)
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const expected = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after staking withdrawal', () => {
				let block: BigNumber
				before(async () => {
					await dev.lockup.cancel(property.address, {from: carol})
					await dev.lockup.withdraw(property.address, {
						from: carol,
					})
					block = await getBlock().then(toBigNumber)
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await mine(6)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const expected = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after withdrawal', () => {
				before(async () => {
					await dev.withdraw.withdraw(property.address, {from: alice})
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal('0')
				})
			})
		})
		describe('scenario: multiple lockup', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let lastBlock: BigNumber
			let calc: Calculator

			const alice = deployer
			const bob = user1
			const carol = user2

			before(async () => {
				;[dev, , property] = await init()
				calc = createCalculator(dev)
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
				await dev.dev.mint(carol, aliceBalance)
				await dev.dev.deposit(property.address, 10000, {from: bob})
				await dev.dev.deposit(property.address, 10000 * 0.25, {from: carol})
			})

			describe('before withdrawal', () => {
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const expected = toBigNumber(90).times(1e18).times(4)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after withdrawal', () => {
				before(async () => {
					await dev.withdraw.withdraw(property.address, {from: alice})
					lastBlock = await getBlock().then(toBigNumber)
				})

				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const expected = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('additional staking', () => {
				before(async () => {
					await dev.dev.deposit(property.address, 10000, {from: bob})
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const expected = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after staking withdrawal', () => {
				it(`Alice's withdrawable holders rewards is correct when also after withdrawal by Carol`, async () => {
					await dev.lockup.cancel(property.address, {from: carol})
					await dev.lockup.withdraw(property.address, {
						from: carol,
					})

					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const expected = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Alice's withdrawable holders rewards is correct when also after withdrawal by Bob`, async () => {
					await dev.lockup.cancel(property.address, {from: bob})
					await dev.lockup.withdraw(property.address, {
						from: bob,
					})
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const expected = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
		})
		describe('scenario: multiple properties', () => {
			let dev: DevProtocolInstance
			let property1: PropertyInstance
			let property2: PropertyInstance
			let property3: PropertyInstance
			let property4: PropertyInstance
			let lastBlock1: BigNumber
			let lastBlock2: BigNumber
			let calc: Calculator

			const alice = deployer
			const bob = user1
			const carol = user2

			before(async () => {
				;[dev, , property1] = await init()
				calc = createCalculator(dev)
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
				await dev.dev.mint(carol, aliceBalance)
				;[property2, property3, property4] = await Promise.all([
					artifacts
						.require('Property')
						.at(
							getPropertyAddress(
								await dev.propertyFactory.create('test2', 'TEST2', bob)
							)
						),
					artifacts
						.require('Property')
						.at(
							getPropertyAddress(
								await dev.propertyFactory.create('test3', 'TEST3', carol)
							)
						),
					artifacts
						.require('Property')
						.at(
							getPropertyAddress(
								await dev.propertyFactory.create('test4', 'TEST4', carol)
							)
						),
				])

				await dev.dev.deposit(property1.address, 10000, {from: alice})
				lastBlock1 = await getBlock().then(toBigNumber)
				await mine(3)
			})

			describe('before withdrawal', () => {
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property4.address, alice)
						.then(toBigNumber)
					const expected = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Property1 is locked-up 100% of all Property's locked-ups`, async () => {
					const total = await dev.lockup.getAllValue().then(toBigNumber)
					const property1Balance = await dev.lockup
						.getPropertyValue(property1.address)
						.then(toBigNumber)
					expect(property1Balance.toFixed()).to.be.equal(total.toFixed())
				})
				it(`Alice's withdrawable holders reward is correct`, async () => {
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property1.address, alice)
						.then(toBigNumber)
					const expected = await calc(property1, alice)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Alice does staking 2500 to Property2, Property2 is 20% of the total rewards`, async () => {
					await dev.dev.deposit(property2.address, 2500, {from: alice})
					lastBlock2 = await getBlock().then(toBigNumber)
					const total = await dev.lockup.getAllValue().then(toBigNumber)
					const p1 = await dev.lockup
						.getPropertyValue(property1.address)
						.then(toBigNumber)
					const p2 = await dev.lockup
						.getPropertyValue(property2.address)
						.then(toBigNumber)
					expect(p1.div(total).toNumber()).to.be.equal(0.8)
					expect(p2.div(total).toNumber()).to.be.equal(0.2)
				})
				it(`Alice does staking 3750 to Property3, Property1 is ${
					1000000 / 16250
				}% of the total rewards, Property2 is ${
					250000 / 16250
				}% of the total rewards`, async () => {
					await dev.dev.deposit(property3.address, 3750, {from: alice})
					lastBlock2 = await getBlock().then(toBigNumber)
					const total = await dev.lockup.getAllValue().then(toBigNumber)
					const p1 = await dev.lockup
						.getPropertyValue(property1.address)
						.then(toBigNumber)
					const p2 = await dev.lockup
						.getPropertyValue(property2.address)
						.then(toBigNumber)
					const p3 = await dev.lockup
						.getPropertyValue(property3.address)
						.then(toBigNumber)
					expect(p1.div(total).toNumber()).to.be.equal(10000 / 16250)
					expect(p2.div(total).toNumber()).to.be.equal(2500 / 16250)
					expect(p3.div(total).toNumber()).to.be.equal(3750 / 16250)
				})
				it(`Alice's withdrawable holders reward is correct`, async () => {
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property1.address, alice)
						.then(toBigNumber)
					const expected = await calc(property1, alice)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after withdrawal', () => {
				before(async () => {
					await dev.withdraw.withdraw(property1.address, {from: alice})
					await dev.withdraw.withdraw(property2.address, {from: bob})
					await dev.withdraw.withdraw(property3.address, {from: carol})
					await mine(3)
				})
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property4.address, alice)
						.then(toBigNumber)
					const expected = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property1.address, alice)
						.then(toBigNumber)
					const expected = await calc(property1, alice)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Bob's withdrawable holders rewards is correct`, async () => {
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property2.address, bob)
						.then(toBigNumber)
					const expected = await calc(property2, bob)
					expect(bobAmount.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Carol's withdrawable holders rewards is correct`, async () => {
					const carolAmount = await dev.withdraw
						.calculateWithdrawableAmount(property3.address, carol)
						.then(toBigNumber)
					const expected = await calc(property3, carol)
					expect(carolAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after additional staking', () => {
				before(async () => {
					await dev.dev.deposit(property1.address, 10000, {from: alice})
					await dev.dev.deposit(property2.address, 10000, {from: alice})
					await dev.dev.deposit(property3.address, 10000, {from: alice})
					await mine(3)
				})
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property4.address, alice)
						.then(toBigNumber)
					const expected = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property1.address, alice)
						.then(toBigNumber)
					const expected = await calc(property1, alice)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Bob's withdrawable holders rewards is correct`, async () => {
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property2.address, bob)
						.then(toBigNumber)
					const expected = await calc(property2, bob)
					expect(bobAmount.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Carol's withdrawable holders rewards is correct`, async () => {
					const carolAmount = await dev.withdraw
						.calculateWithdrawableAmount(property3.address, carol)
						.then(toBigNumber)
					const expected = await calc(property3, carol)
					expect(carolAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after staking withdrawal', () => {
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property4.address, alice)
						.then(toBigNumber)
					const expected = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await dev.lockup.cancel(property1.address, {from: alice})
					await dev.lockup.withdraw(property1.address, {from: alice})
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property1.address, alice)
						.then(toBigNumber)
					const expected = await calc(property1, alice)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Bob's withdrawable holders rewards is correct`, async () => {
					await dev.lockup.cancel(property2.address, {from: alice})
					await dev.lockup.withdraw(property2.address, {from: alice})
					await mine(3)
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property2.address, bob)
						.then(toBigNumber)
					const expected = await calc(property2, bob)
					expect(bobAmount.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Carol's withdrawable holders rewards is correct`, async () => {
					await dev.lockup.cancel(property3.address, {from: alice})
					await dev.lockup.withdraw(property3.address, {from: alice})
					await mine(3)
					const carolAmount = await dev.withdraw
						.calculateWithdrawableAmount(property3.address, carol)
						.then(toBigNumber)
					const expected = await calc(property3, carol)
					expect(carolAmount.toFixed()).to.be.equal(expected.toFixed())
					console.log(1, carolAmount.toFixed())
				})
			})
			describe('after withdrawal', () => {
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property4.address, alice)
						.then(toBigNumber)
					const expected = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await dev.withdraw.withdraw(property1.address, {from: alice})
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property1.address, alice)
						.then(toBigNumber)
					expect(aliceAmount.toFixed()).to.be.equal('0')
				})
				it(`Bob's withdrawable holders rewards is correct`, async () => {
					await dev.withdraw.withdraw(property2.address, {from: bob})
					await mine(3)
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property2.address, bob)
						.then(toBigNumber)
					expect(bobAmount.toFixed()).to.be.equal('0')
				})
				it(`Carol's withdrawable holders rewards is correct`, async () => {
					await dev.withdraw.withdraw(property3.address, {from: carol})
					await mine(3)
					const carolAmount = await dev.withdraw
						.calculateWithdrawableAmount(property3.address, carol)
						.then(toBigNumber)
					expect(carolAmount.toFixed()).to.be.equal('0')
				})
			})
		})
		describe('scenario: fallback legacy rewards', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let property2: PropertyInstance
			let calc: Calculator
			const alice = deployer

			before(async () => {
				;[dev, , property] = await init()
				;[property2] = await Promise.all([
					artifacts
						.require('Property')
						.at(
							getPropertyAddress(
								await dev.propertyFactory.create('test2', 'TEST2', alice)
							)
						),
				])

				calc = createCalculator(dev)
				await dev.addressConfig.setWithdraw(deployer)
				await dev.withdrawStorage.setCumulativePrice(property.address, 10000)
				await dev.withdrawStorage.setLastWithdrawalPrice(
					property.address,
					alice,
					7000
				)
				await dev.addressConfig.setWithdraw(dev.withdraw.address)
			})
			describe('before withdraw interest', () => {
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property2.address, alice)
						.then(toBigNumber)
					const expected = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const aliceBalance = await property.balanceOf(alice).then(toBigNumber)
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const legacy = toBigNumber(10000)
						.minus(7000)
						.times(aliceBalance)
						.div(1e18)
					const expected = await calc(property, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(legacy.toFixed()).to.be.equal(result.toFixed())
				})
			})
			describe('after withdraw interest', () => {
				before(async () => {
					await dev.withdraw.withdraw(property.address, {from: alice})
					await mine(3)
				})
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property2.address, alice)
						.then(toBigNumber)
					const expected = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const legacy = toBigNumber(0)
					const expected = await calc(property, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(legacy.toFixed()).to.be.equal(result.toFixed())
				})
			})
			describe('after staking', () => {
				let lastBlock: BigNumber
				before(async () => {
					await dev.dev.deposit(property.address, 10000)
					lastBlock = await getBlock().then(toBigNumber)
					await mine(3)
				})
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property2.address, alice)
						.then(toBigNumber)
					const expected = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const block = await getBlock().then(toBigNumber)
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const latest = toBigNumber(90)
						.times(1e18)
						.times(block.minus(lastBlock))
					const expected = await calc(property, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(latest.toFixed()).to.be.equal(result.toFixed())
				})
			})
		})
		describe('scenario: fallback legacy rewards and latest rewards', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let property2: PropertyInstance
			let lastBlock: BigNumber
			let calc: Calculator
			const alice = deployer

			before(async () => {
				;[dev, , property] = await init()
				;[property2] = await Promise.all([
					artifacts
						.require('Property')
						.at(
							getPropertyAddress(
								await dev.propertyFactory.create('test2', 'TEST2', alice)
							)
						),
				])
				calc = createCalculator(dev)
				await dev.addressConfig.setWithdraw(deployer)
				await dev.withdrawStorage.setCumulativePrice(property.address, 10000)
				await dev.withdrawStorage.setLastWithdrawalPrice(
					property.address,
					alice,
					7000
				)
				await dev.addressConfig.setWithdraw(dev.withdraw.address)
				await dev.dev.deposit(property.address, 10000)
				lastBlock = await getBlock().then(toBigNumber)
			})
			describe('before withdraw interest', () => {
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property2.address, alice)
						.then(toBigNumber)
					const expected = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const aliceBalance = await property.balanceOf(alice).then(toBigNumber)
					const block = await getBlock().then(toBigNumber)
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const latest = toBigNumber(90)
						.times(1e18)
						.times(block.minus(lastBlock))
					const legacy = toBigNumber(10000)
						.minus(7000)
						.times(aliceBalance)
						.div(1e18)
					const expected = await calc(property, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(latest.plus(legacy).toFixed()).to.be.equal(result.toFixed())
				})
			})
			describe('after withdraw interest', () => {
				before(async () => {
					await dev.withdraw.withdraw(property.address, {from: alice})
					lastBlock = await getBlock().then(toBigNumber)
					await mine(3)
				})
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property2.address, alice)
						.then(toBigNumber)
					const expected = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const block = await getBlock().then(toBigNumber)
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const latest = toBigNumber(90)
						.times(1e18)
						.times(block.minus(lastBlock))
					const expected = await calc(property, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(latest.toFixed()).to.be.equal(result.toFixed())
				})
			})
			describe('after additional staking', () => {
				before(async () => {
					await dev.dev.deposit(property.address, 10000)
					await mine(3)
				})
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property2.address, alice)
						.then(toBigNumber)
					const expected = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const block = await getBlock().then(toBigNumber)
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const latest = toBigNumber(90)
						.times(1e18)
						.times(block.minus(lastBlock))
					const expected = await calc(property, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(latest.toFixed()).to.be.equal(result.toFixed())
				})
			})
		})
	})
	describe('Withdraw; calculateTotalWithdrawableAmount', () => {
		let dev: DevProtocolInstance
		let property: PropertyInstance
		let property2: PropertyInstance
		let lastBlock: BigNumber
		let lastBlock2: BigNumber
		let lastBlock3: BigNumber

		before(async () => {
			;[dev, , property] = await init()
			;[property2] = await Promise.all([
				artifacts
					.require('Property')
					.at(
						getPropertyAddress(
							await dev.propertyFactory.create('test2', 'TEST2', user1)
						)
					),
			])
			await dev.dev.deposit(property.address, 10000)
			lastBlock = await getBlock().then(toBigNumber)
		})

		it('Returns total withdrawable amount of a Property', async () => {
			await mine(1)
			const block = await getBlock().then(toBigNumber)
			const result = await dev.withdraw
				.calculateTotalWithdrawableAmount(property.address)
				.then(toBigNumber)
			const expected = toBigNumber(90).times(1e18).times(block.minus(lastBlock))
			expect(result.toFixed()).to.be.equal(expected.toFixed())
		})
		it('Returns total withdrawable amount also does not change when after transfer balance', async () => {
			await property.transfer(
				user1,
				await property.balanceOf(deployer).then((x) => toBigNumber(x).div(2))
			)
			await mine(1)
			const block = await getBlock().then(toBigNumber)
			const result = await dev.withdraw
				.calculateTotalWithdrawableAmount(property.address)
				.then(toBigNumber)
			const expected = toBigNumber(90).times(1e18).times(block.minus(lastBlock))
			expect(result.toFixed()).to.be.equal(expected.toFixed())
		})
		it('After withdrawn staking, stop increasing', async () => {
			await dev.dev.deposit(property2.address, 10000)
			lastBlock2 = await getBlock().then(toBigNumber)
			await dev.lockup.cancel(property.address)
			await dev.lockup.withdraw(property.address)
			lastBlock3 = await getBlock().then(toBigNumber)
			await mine(3)

			const result = await dev.withdraw
				.calculateTotalWithdrawableAmount(property.address)
				.then(toBigNumber)
			const expected = toBigNumber(90)
				.times(1e18)
				.times(lastBlock2.minus(lastBlock))
				.plus(
					toBigNumber(90)
						.times(1e18)
						.times(0.5)
						.times(lastBlock3.minus(lastBlock2))
				)
			expect(result.toFixed()).to.be.equal(expected.toFixed())
		})
	})
})
