import {DevProtocolInstance} from '../test-lib/instance'
import {MetricsInstance, PropertyInstance} from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import {
	getPropertyAddress,
	getMarketAddress,
	getEventValue,
	validateErrorMessage
} from '../test-lib/utils'
const uri = 'ws://localhost:7545'

contract('WithdrawTest', ([deployer, user1]) => {
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
		const metricsAddress = await (async () => {
			market.authenticate(property.address, '', '', '', '', '')
			return getEventValue(dev.metricsFactory, uri)('Create', '_metrics')
		})()
		const [metrics] = await Promise.all([
			artifacts.require('Metrics').at(metricsAddress as string)
		])
		await dev.dev.addMinter(dev.withdraw.address)
		return [dev, metrics, property]
	}

	const toBigNumber = (v: string | BigNumber): BigNumber => new BigNumber(v)

	describe('Withdraw; withdraw', () => {
		describe('Withdraw; Withdraw is mint', () => {
			it('Withdraw mints an ERC20 token specified in the Address Config Contract', async () => {
				const [dev, metrics, property] = await init()
				const prev = await dev.dev.totalSupply().then(toBigNumber)
				const balance = await dev.dev.balanceOf(deployer).then(toBigNumber)

				await dev.allocator.allocate(metrics.address)
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
				const [dev, metrics, property] = await init()
				const totalSupply = await property.totalSupply().then(toBigNumber)

				await property.transfer(user1, totalSupply.times(0.2), {
					from: deployer
				})

				await dev.allocator.allocate(metrics.address)

				const totalAmount = await dev.withdrawStorage
					.getRewardsAmount(property.address)
					.then(toBigNumber)
				const amount1 = await dev.withdraw
					.calculateWithdrawableAmount(property.address, deployer)
					.then(toBigNumber)
				const amount2 = await dev.withdraw
					.calculateWithdrawableAmount(property.address, user1)
					.then(toBigNumber)

				expect(totalAmount.toFixed()).to.be.equal(
					amount1.plus(amount2).toFixed()
				)
				expect(totalAmount.times(0.8).toFixed()).to.be.equal(amount1.toFixed())
				expect(totalAmount.times(0.2).toFixed()).to.be.equal(amount2.toFixed())
			})

			it('The withdrawal amount is always the full amount of the withdrawable amount', async () => {
				const [dev, metrics, property] = await init()
				const totalSupply = await property.totalSupply().then(toBigNumber)
				const prevBalance1 = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const prevBalance2 = await dev.dev.balanceOf(user1).then(toBigNumber)

				await property.transfer(user1, totalSupply.times(0.2), {
					from: deployer
				})

				await dev.allocator.allocate(metrics.address)

				const amount1 = await dev.withdraw
					.calculateWithdrawableAmount(property.address, deployer)
					.then(toBigNumber)
				const amount2 = await dev.withdraw
					.calculateWithdrawableAmount(property.address, user1)
					.then(toBigNumber)
				await dev.withdraw.withdraw(property.address, {from: deployer})
				await dev.withdraw.withdraw(property.address, {from: user1})

				const nextBalance1 = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const nextBalance2 = await dev.dev.balanceOf(user1).then(toBigNumber)

				expect(prevBalance1.plus(amount1).toFixed()).to.be.equal(
					nextBalance1.toFixed()
				)
				expect(prevBalance2.plus(amount2).toFixed()).to.be.equal(
					nextBalance2.toFixed()
				)
			})

			it('should fail to withdraw when the withdrawable amount is 0', async () => {
				const [dev, metrics, property] = await init()
				const prevBalance = await dev.dev.balanceOf(user1).then(toBigNumber)

				await dev.allocator.allocate(metrics.address)

				const amount = await dev.withdraw
					.calculateWithdrawableAmount(property.address, user1)
					.then(toBigNumber)
				const res = await dev.withdraw
					.withdraw(property.address, {from: user1})
					.catch((err: Error) => err)
				const afterBalance = await dev.dev.balanceOf(user1).then(toBigNumber)

				expect(amount.toFixed()).to.be.equal('0')
				expect(prevBalance.toFixed()).to.be.equal(afterBalance.toFixed())
				validateErrorMessage(res as Error, 'withdraw value is 0')
			})
		})
	})
	describe('Withdraw; beforeBalanceChange', () => {
		describe('Withdraw; Alice has sent 10% tokens to Bob after 20% tokens sent. Bob has increased from 10% tokens to 30% tokens.', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let metrics: MetricsInstance
			const alice = deployer
			const bob = user1

			before(async () => {
				;[dev, metrics, property] = await init()

				const totalSupply = await property.totalSupply().then(toBigNumber)
				await property.transfer(bob, totalSupply.times(0.2), {
					from: alice
				})
				await dev.allocator.allocate(metrics.address)
				await property.transfer(bob, totalSupply.times(0.1), {
					from: alice
				})
			})

			describe('Withdraw; Before increment', () => {
				it(`Alice's withdrawable amount is 80% of reward`, async () => {
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const totalAmount = await dev.withdraw
						.getRewardsAmount(property.address)
						.then(toBigNumber)

					// 1 or less is within the error range.
					expect(
						aliceAmount.minus(totalAmount.times(0.8).integerValue()).toNumber()
					).to.be.within(-1, 1)
				})

				it(`Bob's withdrawable amount is 20% of reward`, async () => {
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, bob)
						.then(toBigNumber)
					const totalAmount = await dev.withdraw
						.getRewardsAmount(property.address)
						.then(toBigNumber)

					// 1 or less is within the error range.
					expect(
						bobAmount.minus(totalAmount.times(0.2).integerValue()).toNumber()
					).to.be.within(-1, 1)
				})
			})

			describe('Withdraw; After increment', () => {
				it(`Alice's withdrawable amount is ${1000 * 100 + 200 * 120}`)

				it(`Bob's withdrawable amount is ${200 * 100 + 1000 * 120}`)
			})

			it(
				'Should fail to call `beforeBalanceChange` when sent from other than Property Contract address'
			)
		})
		it(
			'should fail to call the function when sent from other than Allocator Contract'
		)
	})
})
