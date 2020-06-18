/* eslint-disable no-warning-comments */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {DevProtocolInstance} from '../test-lib/instance'
import {MetricsInstance, PropertyInstance} from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import {mine, toBigNumber, getBlock} from '../test-lib/utils/common'
import {getPropertyAddress, getMarketAddress} from '../test-lib/utils/log'
import {getEventValue, watch} from '../test-lib/utils/event'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
	validatePauseErrorMessage,
} from '../test-lib/utils/error'
import {WEB3_URI} from '../test-lib/const'

contract('WithdrawTest', ([deployer, user1, user2, user3]) => {
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
		const policy = await artifacts.require('PolicyTestForWithdraw').new()

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
		const metricsAddress = await (async () => {
			return getEventValue(dev.metricsFactory, WEB3_URI)('Create', '_metrics')
		})()
		const [metrics] = await Promise.all([
			artifacts.require('Metrics').at(metricsAddress as string),
		])
		await dev.dev.addMinter(dev.withdraw.address)
		return [dev, metrics, property]
	}

	// TODO:
	// describe('Withdraw; withdraw', () => {
	// 	it('should fail to call when passed address is not property contract', async () => {
	// 		const [dev] = await init()

	// 		const res = await dev.withdraw
	// 			.withdraw(deployer)
	// 			.catch((err: Error) => err)
	// 		validateAddressErrorMessage(res)
	// 	})
	// 	it(`should fail to call when hasn't withdrawable amount`, async () => {
	// 		const [dev, , property] = await init()
	// 		const res = await dev.withdraw
	// 			.withdraw(property.address, {from: user1})
	// 			.catch((err: Error) => err)
	// 		validateErrorMessage(res, 'withdraw value is 0')
	// 	})
	// 	describe('withdrawing interest amount', () => {
	// 		let dev: DevProtocolInstance
	// 		let property: PropertyInstance

	// 		before(async () => {
	// 			;[dev, , property] = await init()
	// 			await dev.dev.deposit(property.address, 10000)
	// 		})

	// 		it(`withdrawing sender's withdrawable interest full amount`, async () => {
	// 			const beforeBalance = await dev.dev
	// 				.balanceOf(deployer)
	// 				.then(toBigNumber)
	// 			const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)
	// 			await mine(10)
	// 			const amount = await dev.withdraw
	// 				.calculateWithdrawableAmount(property.address, deployer)
	// 				.then(toBigNumber)
	// 			await dev.withdraw.withdraw(property.address)
	// 			const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
	// 			const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

	// 			expect(amount.toFixed()).to.be.equal('90000000000000000000')
	// 			expect(afterBalance.toFixed()).to.be.equal(
	// 				beforeBalance.plus(amount).toFixed()
	// 			)
	// 			expect(afterTotalSupply.toFixed()).to.be.equal(
	// 				beforeTotalSupply.plus(amount).toFixed()
	// 			)
	// 		})
	// 		it('withdrawable interest amount becomes 0 when after withdrawing interest', async () => {
	// 			const amount = await dev.withdraw
	// 				.calculateWithdrawableAmount(property.address, deployer)
	// 				.then(toBigNumber)
	// 			expect(amount.toFixed()).to.be.equal('0')
	// 		})
	// 	})
	// 	describe('Withdraw; Withdraw is mint', () => {
	// 		it('Withdraw mints an ERC20 token specified in the Address Config Contract', async () => {
	// 			// Const [dev, metrics, property] = await init()
	// 			const [dev, , property] = await init()
	// 			const prev = await dev.dev.totalSupply().then(toBigNumber)
	// 			const balance = await dev.dev.balanceOf(deployer).then(toBigNumber)

	// 			// Await dev.allocator.allocate(metrics.address)
	// 			await dev.withdraw.withdraw(property.address)

	// 			const next = await dev.dev.totalSupply().then(toBigNumber)
	// 			const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
	// 			const gap = next.minus(prev)

	// 			expect(prev.toString()).to.be.not.equal(next.toString())
	// 			expect(balance.plus(gap).toString()).to.be.equal(
	// 				afterBalance.toString()
	// 			)
	// 		})
	// 	})

	// 	describe('Withdraw; Withdrawable amount', () => {
	// 		it('The withdrawable amount each holder is the number multiplied the balance of the price per Property Contract and the Property Contract of the sender', async () => {
	// 			// Const [dev, metrics, property] = await init()
	// 			const [dev, , property] = await init()
	// 			const totalSupply = await property.totalSupply().then(toBigNumber)

	// 			await property.transfer(user1, totalSupply.times(0.2), {
	// 				from: deployer,
	// 			})

	// 			// Await dev.allocator.allocate(metrics.address)

	// 			const totalAmount = await dev.withdrawStorage
	// 				.getRewardsAmount(property.address)
	// 				.then(toBigNumber)
	// 			const amount1 = await dev.withdraw
	// 				.calculateWithdrawableAmount(property.address, deployer)
	// 				.then(toBigNumber)
	// 			const amount2 = await dev.withdraw
	// 				.calculateWithdrawableAmount(property.address, user1)
	// 				.then(toBigNumber)

	// 			expect(
	// 				totalAmount.times(0.8).integerValue(BigNumber.ROUND_DOWN).toFixed()
	// 			).to.be.equal(amount1.toFixed())
	// 			expect(
	// 				totalAmount.times(0.2).integerValue(BigNumber.ROUND_DOWN).toFixed()
	// 			).to.be.equal(amount2.toFixed())
	// 		})

	// 		it('The withdrawal amount is always the full amount of the withdrawable amount', async () => {
	// 			// Const [dev, metrics, property] = await init()
	// 			const [dev, , property] = await init()
	// 			const totalSupply = await property.totalSupply().then(toBigNumber)
	// 			const prevBalance1 = await dev.dev.balanceOf(deployer).then(toBigNumber)
	// 			const prevBalance2 = await dev.dev.balanceOf(user1).then(toBigNumber)

	// 			await property.transfer(user1, totalSupply.times(0.2), {
	// 				from: deployer,
	// 			})

	// 			// Await dev.allocator.allocate(metrics.address)

	// 			const amount1 = await dev.withdraw
	// 				.calculateWithdrawableAmount(property.address, deployer)
	// 				.then(toBigNumber)
	// 			const amount2 = await dev.withdraw
	// 				.calculateWithdrawableAmount(property.address, user1)
	// 				.then(toBigNumber)
	// 			await dev.withdraw.withdraw(property.address, {from: deployer})
	// 			await dev.withdraw.withdraw(property.address, {from: user1})

	// 			const nextBalance1 = await dev.dev.balanceOf(deployer).then(toBigNumber)
	// 			const nextBalance2 = await dev.dev.balanceOf(user1).then(toBigNumber)

	// 			expect(prevBalance1.plus(amount1).toFixed()).to.be.equal(
	// 				nextBalance1.toFixed()
	// 			)
	// 			expect(prevBalance2.plus(amount2).toFixed()).to.be.equal(
	// 				nextBalance2.toFixed()
	// 			)
	// 		})

	// 		it('should fail to withdraw when the withdrawable amount is 0', async () => {
	// 			// Const [dev, metrics, property] = await init()
	// 			const [dev, , property] = await init()
	// 			const prevBalance = await dev.dev.balanceOf(user1).then(toBigNumber)

	// 			// Await dev.allocator.allocate(metrics.address)

	// 			const amount = await dev.withdraw
	// 				.calculateWithdrawableAmount(property.address, user1)
	// 				.then(toBigNumber)
	// 			const res = await dev.withdraw
	// 				.withdraw(property.address, {from: user1})
	// 				.catch((err: Error) => err)
	// 			const afterBalance = await dev.dev.balanceOf(user1).then(toBigNumber)

	// 			expect(amount.toFixed()).to.be.equal('0')
	// 			expect(prevBalance.toFixed()).to.be.equal(afterBalance.toFixed())
	// 			validateErrorMessage(res, 'withdraw value is 0')
	// 		})
	// 	})
	// })

	// describe('Withdraw; beforeBalanceChange', () => {
	// 	describe('Withdraw; Alice has sent 10% tokens to Bob after 20% tokens sent. Bob has increased from 10% tokens to 30% tokens.', () => {
	// 		let dev: DevProtocolInstance
	// 		let property: PropertyInstance
	// 		// Let metrics: MetricsInstance
	// 		const alice = deployer
	// 		const bob = user1

	// 		before(async () => {
	// 			// ;[dev, metrics, property] = await init()
	// 			;[dev, , property] = await init()

	// 			const totalSupply = await property.totalSupply().then(toBigNumber)
	// 			await property.transfer(bob, totalSupply.times(0.2), {
	// 				from: alice,
	// 			})
	// 			// Await dev.allocator.allocate(metrics.address)
	// 			await property.transfer(bob, totalSupply.times(0.1), {
	// 				from: alice,
	// 			})
	// 		})

	// 		describe('Withdraw; Before increment', () => {
	// 			it(`Alice's withdrawable amount is 80% of reward`, async () => {
	// 				const aliceAmount = await dev.withdraw
	// 					.calculateWithdrawableAmount(property.address, alice)
	// 					.then(toBigNumber)
	// 				const totalAmount = await dev.withdraw
	// 					.getRewardsAmount(property.address)
	// 					.then(toBigNumber)

	// 				expect(aliceAmount.toFixed()).to.be.equal(
	// 					totalAmount.times(0.8).integerValue(BigNumber.ROUND_DOWN).toFixed()
	// 				)
	// 			})

	// 			it(`Bob's withdrawable amount is 20% of reward`, async () => {
	// 				const bobAmount = await dev.withdraw
	// 					.calculateWithdrawableAmount(property.address, bob)
	// 					.then(toBigNumber)
	// 				const totalAmount = await dev.withdraw
	// 					.getRewardsAmount(property.address)
	// 					.then(toBigNumber)

	// 				expect(bobAmount.toFixed()).to.be.equal(
	// 					totalAmount.times(0.2).integerValue(BigNumber.ROUND_DOWN).toFixed()
	// 				)
	// 			})
	// 		})

	// 		describe('Withdraw; After increment', () => {
	// 			let prev: BigNumber
	// 			before(async () => {
	// 				prev = await dev.withdraw
	// 					.getRewardsAmount(property.address)
	// 					.then(toBigNumber)
	// 				// Await dev.allocator.allocate(metrics.address)
	// 			})

	// 			it(`Alice's withdrawable amount is 80% of prev reward and 70% of current reward`, async () => {
	// 				const aliceAmount = await dev.withdraw
	// 					.calculateWithdrawableAmount(property.address, alice)
	// 					.then(toBigNumber)
	// 				const increased = (
	// 					await dev.withdraw
	// 						.getRewardsAmount(property.address)
	// 						.then(toBigNumber)
	// 				).minus(prev)

	// 				expect(aliceAmount.toFixed()).to.be.equal(
	// 					prev
	// 						.times(0.8)
	// 						.integerValue(BigNumber.ROUND_DOWN)
	// 						.plus(
	// 							increased.times(0.1).integerValue(BigNumber.ROUND_DOWN).times(7)
	// 						)
	// 						.integerValue(BigNumber.ROUND_DOWN)
	// 						.toFixed()
	// 				)
	// 			})

	// 			it(`Bob's withdrawable amount is 20% of prev reward and 30% of current reward`, async () => {
	// 				const bobAmount = await dev.withdraw
	// 					.calculateWithdrawableAmount(property.address, bob)
	// 					.then(toBigNumber)
	// 				const increased = (
	// 					await dev.withdraw
	// 						.getRewardsAmount(property.address)
	// 						.then(toBigNumber)
	// 				).minus(prev)

	// 				expect(bobAmount.toFixed()).to.be.equal(
	// 					prev
	// 						.times(0.2)
	// 						.integerValue(BigNumber.ROUND_DOWN)
	// 						.plus(increased.times(0.3))
	// 						.integerValue(BigNumber.ROUND_DOWN)
	// 						.toFixed()
	// 				)
	// 			})

	// 			it('Become 0 withdrawable amount when after withdrawing', async () => {
	// 				await dev.withdraw.withdraw(property.address, {from: alice})
	// 				await dev.withdraw.withdraw(property.address, {from: bob})
	// 				const aliceAmount = await dev.withdraw
	// 					.calculateWithdrawableAmount(property.address, alice)
	// 					.then(toBigNumber)
	// 				const bobAmount = await dev.withdraw
	// 					.calculateWithdrawableAmount(property.address, bob)
	// 					.then(toBigNumber)

	// 				expect(aliceAmount.toFixed()).to.be.equal('0')
	// 				expect(bobAmount.toFixed()).to.be.equal('0')
	// 			})
	// 		})

	// 		it('Should fail to call `beforeBalanceChange` when sent from other than Property Contract address', async () => {
	// 			const res = await dev.withdraw
	// 				.beforeBalanceChange(property.address, deployer, user1, {
	// 					from: deployer,
	// 				})
	// 				.catch((err: Error) => err)
	// 			validateAddressErrorMessage(res)
	// 		})
	// 	})
	// })
	// describe('Withdraw; pause', () => {
	// 	it('should fail to call when paused.', async () => {
	// 		const [dev, , property] = await init()
	// 		await dev.withdraw.pause()
	// 		let res = await dev.withdraw
	// 			.getRewardsAmount(property.address)
	// 			.catch((err: Error) => err)
	// 		validatePauseErrorMessage(res, false)
	// 		await dev.withdraw.unpause()
	// 		res = await dev.withdraw.getRewardsAmount(property.address)
	// 		expect(res.toNumber()).to.be.equal(0)
	// 	})
	// })
	describe('Withdraw; calculateWithdrawableAmount', () => {
		describe('scenario; single lockup', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let lastBlock: BigNumber

			const alice = deployer
			const bob = user1
			const carol = user2

			before(async () => {
				;[dev, , property] = await init()
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
					lastBlock = await getBlock().then(toBigNumber)
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await mine(3)
					const block = await getBlock().then(toBigNumber)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const expected = toBigNumber(90)
						.times(1e18)
						.times(block.minus(lastBlock))
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
					const block = await getBlock().then(toBigNumber)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const expected = toBigNumber(90)
						.times(1e18)
						.times(block.minus(lastBlock))
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
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const expected = toBigNumber(90)
						.times(1e18)
						.times(block.minus(lastBlock))
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
					expect(aliceAmount.toFixed()).to.be.equal('0')
				})
			})
		})
	})
})
