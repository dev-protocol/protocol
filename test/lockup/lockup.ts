/* eslint-disable capitalized-comments */
import {DevProtocolInstance} from '../test-lib/instance'
import {
	PropertyInstance,
	PolicyTestForLockupInstance,
} from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import {
	mine,
	toBigNumber,
	getBlock,
	gasLogger,
	keccak256,
} from '../test-lib/utils/common'
import {getPropertyAddress} from '../test-lib/utils/log'
import {waitForEvent, getEventValue} from '../test-lib/utils/event'
import {validateErrorMessage} from '../test-lib/utils/error'

contract('LockupTest', ([deployer, user1]) => {
	const init = async (
		initialUpdate = true
	): Promise<
		[DevProtocolInstance, PropertyInstance, PolicyTestForLockupInstance]
	> => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
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
			dev.generateVoteCounter(),
			dev.generatePolicyFactory(),
			dev.generatePolicyGroup(),
			dev.generateDev(),
		])
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		const policy = await artifacts.require('PolicyTestForLockup').new()

		await dev.policyFactory.create(policy.address)
		const propertyAddress = getPropertyAddress(
			await dev.propertyFactory.create('test', 'TEST', deployer)
		)
		const [property] = await Promise.all([
			artifacts.require('Property').at(propertyAddress),
		])

		await dev.addressConfig.setMetricsFactory(deployer)
		await dev.metricsGroup.addGroup(
			(await dev.createMetrics(deployer, property.address)).address
		)

		await dev.dev.addMinter(dev.lockup.address)
		if (initialUpdate) {
			await dev.lockup.update()
		}

		return [dev, property, policy]
	}

	const err = (error: Error): Error => error

	describe('Lockup; lockup', () => {
		it('should fail to call when sent from other than Dev Contract', async () => {
			const [dev, property] = await init()

			const res = await dev.lockup
				.lockup(deployer, property.address, 10000)
				.catch(err)
			validateErrorMessage(res, 'this is illegal address')
		})
		it('should fail to call when passed address is not property contract', async () => {
			const [dev] = await init()

			const res = await dev.dev.deposit(user1, 10000).catch(err)
			validateErrorMessage(res, 'unable to stake to unauthenticated property')
		})
		it('should fail to call when a passed value is 0', async () => {
			const [dev, property] = await init()

			await dev.lockup.changeOwner(deployer)
			const storage = await dev.lockup
				.getStorageAddress()
				.then((x) => artifacts.require('EternalStorage').at(x))
			await storage.setUint(
				keccak256('_withdrawalStatus', property.address, deployer),
				1
			)
			await storage.changeOwner(dev.lockup.address)
			await dev.addressConfig.setToken(deployer)

			const res = await dev.lockup
				.lockup(deployer, property.address, 0)
				.catch(err)
			validateErrorMessage(res, 'illegal lockup value')
		})
		it(`should fail to call when token's transfer was failed`, async () => {
			const [dev, property] = await init()

			const res = await dev.dev
				.deposit(property.address, 10000, {from: user1})
				.catch(err)
			validateErrorMessage(res, 'ERC20: transfer amount exceeds balance')
		})
		it(`should fail to call when the passed property has not any authenticated assets`, async () => {
			const [dev] = await init()
			const propertyAddress = getPropertyAddress(
				await dev.propertyFactory.create('test', 'TEST', deployer)
			)

			const res = await dev.dev.deposit(propertyAddress, 10000).catch(err)
			validateErrorMessage(res, 'unable to stake to unauthenticated property')
		})
		it('record transferred token as a lockup', async () => {
			const [dev, property] = await init()

			dev.dev.deposit(property.address, 10000).catch(err)
			await waitForEvent(dev.lockup)('Lockedup')

			const lockedupAmount = await dev.lockup
				.getValue(property.address, deployer)
				.then(toBigNumber)
			expect(lockedupAmount.toFixed()).to.be.equal('10000')
			const lockedupAllAmount = await dev.lockup.getAllValue().then(toBigNumber)
			expect(lockedupAllAmount.toFixed()).to.be.equal('10000')
		})
		it('emit an event that notifies token locked-up', async () => {
			const [dev, property] = await init()

			dev.dev.deposit(property.address, 10000).catch(err)
			const [_from, _property, _value] = await Promise.all([
				getEventValue(dev.lockup)('Lockedup', '_from'),
				getEventValue(dev.lockup)('Lockedup', '_property'),
				getEventValue(dev.lockup)('Lockedup', '_value'),
			])

			expect(_from).to.be.equal(deployer)
			expect(_property).to.be.equal(property.address)
			expect(_value).to.be.equal('10000')
		})
	})
	describe('Lockup; withdraw', () => {
		it('should fail to call when tokens are not locked', async () => {
			const [dev, property] = await init()

			const res = await dev.lockup.withdraw(property.address, 1000).catch(err)
			validateErrorMessage(res, 'tokens are not staked or insufficient staked')
		})
		it('should fail to call when tokens are insufficient', async () => {
			const [dev, property] = await init()
			const amount = 1000000
			await dev.dev.deposit(property.address, amount)

			const res = await dev.lockup
				.withdraw(property.address, amount + 1)
				.catch(err)
			validateErrorMessage(res, 'tokens are not staked or insufficient staked')
		})
		it('should fail to call when waiting for released', async () => {
			const [dev, property, policy] = await init()

			const block = await getBlock()
			await policy.setLockUpBlocks(block + 9999)

			await dev.dev.deposit(property.address, 10000)
			await mine(5)

			const res = await dev.lockup.withdraw(property.address, 0).catch(err)
			validateErrorMessage(res, 'waiting for release')
		})
		it(`withdraw the amount passed`, async () => {
			const [dev, property] = await init()
			const beforeBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			await dev.dev.deposit(property.address, 10000)
			let lockedupAllAmount = await dev.lockup.getAllValue().then(toBigNumber)
			expect(lockedupAllAmount.toFixed()).to.be.equal('10000')

			await dev.lockup.withdraw(property.address, 1000)
			lockedupAllAmount = await dev.lockup.getAllValue().then(toBigNumber)
			expect(lockedupAllAmount.toFixed()).to.be.equal('9000')
			const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)
			const reward = toBigNumber(10).times(1e18)

			expect(afterBalance.toFixed()).to.be.equal(
				beforeBalance.minus(9000).plus(reward).toFixed()
			)
			expect(afterTotalSupply.toFixed()).to.be.equal(
				beforeTotalSupply.plus(reward).toFixed()
			)
		})
	})
	describe.only('Lockup; calculateWithdrawableInterestAmount', () => {
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
				dev.lockup.calculateCumulativeRewardPrices().then((x) => x[0]),
				dev.lockup.calculateCumulativeRewardPrices().then((x) => x[1]),
				dev.lockup.calculateCumulativeRewardPrices().then((x) => x[2]),
				dev.lockup.getStorageLastStakedInterestPrice(prop.address, account),
				dev.lockup.getValue(prop.address, account),
				dev.lockup.getStoragePendingInterestWithdrawal(prop.address, account),
				dev.lockup.getStorageInterestPrice(prop.address),
				dev.lockup.getStorageLastInterestPrice(prop.address, account),
			]).then((results) => {
				const [
					maxRewards,
					holdersPrice,
					interestPrice,
					lastInterestPrice,
					lockedUpPerUser,
					pending,
					legacyInterestPrice,
					legacyInterestPricePerUser,
				] = results.map(toBigNumber)
				const interest = interestPrice
					.minus(lastInterestPrice)
					.times(lockedUpPerUser)
				const legacyValue = legacyInterestPrice
					.minus(legacyInterestPricePerUser)
					.times(lockedUpPerUser)
					.div(1e18)
				const withdrawable = interest.div(1e18).plus(pending).plus(legacyValue)
				const res = withdrawable.integerValue(BigNumber.ROUND_DOWN)
				if (debug) {
					console.log(results.map(toBigNumber))
					console.log('maxRewards', maxRewards)
					console.log('holdersPrice', holdersPrice)
					console.log('interestPrice', interestPrice.toFixed())
					console.log('lastInterestPrice', lastInterestPrice.toFixed())
					console.log('lockedUpPerUser', lockedUpPerUser.toFixed())
					console.log('pending', pending.toFixed())
					console.log('legacyInterestPrice', legacyInterestPrice.toFixed())
					console.log(
						'legacyInterestPricePerUser',
						legacyInterestPricePerUser.toFixed()
					)
					console.log('interest', interest.toFixed())
					console.log('legacyValue', legacyValue.toFixed())
					console.log('withdrawable', withdrawable.toFixed())
					console.log('res', res.toFixed())
				}

				return res
			})

		describe('returns correct amount', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let calc: Calculator

			const alice = deployer
			const bob = user1

			before(async () => {
				;[dev, property] = await init()
				calc = createCalculator(dev)
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
			})

			/*
			 * PolicyTestForLockup returns 100 as rewards
			 * And stakers share is 10%
			 */

			it('Alice has a 100% of interests', async () => {
				await dev.dev
					.deposit(property.address, 1000000000000, {from: alice})
					.then(gasLogger)
				await mine(1)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmount(property.address, alice)
					.then(toBigNumber)
				const expected = toBigNumber(10).times(1e18)
				const calculated = await calc(property, alice)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated.toFixed())
			})
			it('Alice has a 100% of interests after withdrawal', async () => {
				await dev.lockup.withdraw(property.address, 0, {from: alice})
				await mine(1)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmount(property.address, alice)
					.then(toBigNumber)
				const expected = toBigNumber(10).times(1e18)
				const calculated = await calc(property, alice)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated.toFixed())
			})
			it('Alice has a 50% of interests', async () => {
				await dev.dev
					.deposit(property.address, 1000000000000, {from: bob})
					.then(gasLogger)
				await dev.lockup.withdraw(property.address, 0, {from: alice})
				await mine(1)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmount(property.address, alice)
					.then(toBigNumber)
				const expected = toBigNumber(10)
					.times(1e18)
					.times(1000000000000 / (1000000000000 * 2))
				const calculated = await calc(property, alice)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated.toFixed())
			})
			it('Alice has a 75% of interests', async () => {
				await dev.dev
					.deposit(property.address, 1000000000000, {from: alice})
					.then(gasLogger)
				await dev.dev
					.deposit(property.address, 1000000000000, {from: alice})
					.then(gasLogger)
				await dev.lockup.withdraw(property.address, 0, {from: alice})
				await mine(1)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmount(property.address, alice)
					.then(toBigNumber)
				const expected = toBigNumber(10)
					.times(1e18)
					.times(3000000000000 / (1000000000000 * 4))
				const calculated = await calc(property, alice)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated.toFixed())
			})
			it('Bob has a 30% of interests before withdrawal', async () => {
				const result = await dev.lockup
					.calculateWithdrawableInterestAmount(property.address, bob)
					.then(toBigNumber)
				const expected = toBigNumber(10)
					.times(1e18)
					.times(
						toBigNumber(1000000000000).div(toBigNumber(1000000000000).times(2))
					)
					.times(3)
					.plus(
						toBigNumber(10)
							.times(1e18)
							.times(
								toBigNumber(1000000000000).div(
									toBigNumber(1000000000000).times(3)
								)
							)
					)
					.plus(
						toBigNumber(10)
							.times(1e18)
							.times(
								toBigNumber(1000000000000).div(
									toBigNumber(1000000000000).times(4)
								)
							)
							.times(2)
					)
					.integerValue()
				const calculated = await calc(property, bob)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated.toFixed())
			})
			it('Bob has a 25% of interests', async () => {
				await dev.lockup.withdraw(property.address, 0, {from: bob})
				await mine(1)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmount(property.address, bob)
					.then(toBigNumber)
				const expected = toBigNumber(10)
					.times(1e18)
					.times(1000000000000 / (1000000000000 * 4))
				const calculated = await calc(property, bob)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated.toFixed())
			})
			it('Alice can withdraw 5 blocks', async () => {
				await dev.lockup.withdraw(property.address, 0, {from: alice})
				await mine(5)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmount(property.address, alice)
					.then(toBigNumber)
				const expected = toBigNumber(10)
					.times(1e18)
					.times(3000000000000 / (1000000000000 * 4))
					.times(5)
				const calculated = await calc(property, alice)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated.toFixed())
			})
			it('Alice has a 100% of interests', async () => {
				await dev.lockup.withdraw(
					property.address,
					await dev.lockup.getValue(property.address, alice),
					{from: alice}
				)
				await dev.lockup.withdraw(
					property.address,
					await dev.lockup.getValue(property.address, bob),
					{from: bob}
				)
				await dev.dev
					.deposit(property.address, 1000000000000, {from: alice})
					.then(gasLogger)
				await mine(1)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmount(property.address, alice)
					.then(toBigNumber)
				const expected = toBigNumber(10).times(1e18)
				const calculated = await calc(property, alice)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated.toFixed())
			})
			it('After withdrawn, Alice and Bob has a 0% of interests', async () => {
				await dev.dev
					.deposit(property.address, 1000000000000, {from: alice})
					.then(gasLogger)
				await dev.dev
					.deposit(property.address, 1000000000000, {from: bob})
					.then(gasLogger)
				await mine(2)
				await dev.lockup.withdraw(
					property.address,
					await dev.lockup.getValue(property.address, alice),
					{from: alice}
				)
				await dev.lockup.withdraw(
					property.address,
					await dev.lockup.getValue(property.address, bob),
					{from: bob}
				)
				await mine(1)
				const aliceAmount = await dev.lockup.calculateWithdrawableInterestAmount(
					property.address,
					alice
				)
				const bobAmount = await dev.lockup.calculateWithdrawableInterestAmount(
					property.address,
					bob
				)
				const aliceCalculated = await calc(property, alice)
				const bobCalculated = await calc(property, bob)

				expect(aliceAmount.toString()).to.be.equal('0')
				expect(bobAmount.toString()).to.be.equal('0')
				expect(aliceCalculated.toString()).to.be.equal('0')
				expect(bobCalculated.toString()).to.be.equal('0')
			})
			it('Bob has huge staked, Alice has small amount of reward', async () => {
				const [property2] = await Promise.all([
					artifacts
						.require('Property')
						.at(
							getPropertyAddress(
								await dev.propertyFactory.create('test', 'TEST', deployer)
							)
						),
				])
				await dev.metricsGroup.__setMetricsCountPerProperty(
					property2.address,
					1
				)

				const bobBalance = toBigNumber(10000000).times(1e18)
				await dev.dev.mint(bob, bobBalance)
				await dev.dev
					.deposit(property.address, bobBalance, {from: bob})
					.then(gasLogger)
				await mine(10)

				await dev.dev
					.deposit(property2.address, 10000000, {from: alice})
					.then(gasLogger)
				await mine(1)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmount(property2.address, alice)
					.then(toBigNumber)
				const expected = toBigNumber(10)
					.times(1e18)
					.times(
						toBigNumber(10000000).div(toBigNumber(10000000).plus(bobBalance))
					)
				const calculated = await calc(property2, alice)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated.toFixed())
			})
			it('Property that unauthenticated but already staked before DIP9 has no reward', async () => {
				const propertyAddress = getPropertyAddress(
					await dev.propertyFactory.create('test', 'TEST', deployer)
				)
				await dev.metricsGroup.__setMetricsCountPerProperty(propertyAddress, 1)
				await dev.dev
					.deposit(propertyAddress, 1000000000000, {from: alice})
					.then(gasLogger)
				await mine(1)
				await dev.dev
					.deposit(propertyAddress, 1000000000000, {from: alice})
					.then(gasLogger)
				await mine(1)
				await dev.metricsGroup.__setMetricsCountPerProperty(propertyAddress, 0)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmount(propertyAddress, alice)
					.then(toBigNumber)
				const expected = toBigNumber(0)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
			})
		})

		describe('scenario; single lockup', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let lastBlock: BigNumber

			const alice = deployer
			const bob = user1

			before(async () => {
				;[dev, property] = await init()
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
				await dev.dev
					.deposit(property.address, 10000, {from: alice})
					.then(gasLogger)
				lastBlock = await getBlock().then(toBigNumber)
			})

			/*
			 * PolicyTestForLockup returns 100 as rewards
			 * And stakers share is 10%
			 */

			describe('before second run', () => {
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
					await mine(9)
					const block = await getBlock().then(toBigNumber)
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					const expected = toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
						.times(1e18)
						.times(block.minus(lastBlock))
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after second run', () => {
				before(async () => {
					await dev.lockup.withdraw(property.address, 0, {from: alice})
					lastBlock = await getBlock().then(toBigNumber)
				})
				it(`Alice's withdrawable interest is 100% of the Property's interest`, async () => {
					await mine(3)
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					const expected = toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
						.times(1e18)
						.times(3)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after additional staking', () => {
				before(async () => {
					await dev.dev.deposit(property.address, 10000, {from: alice})
				})
				it(`Alice's withdrawable interest is 100% of the Property's interest`, async () => {
					const block = await getBlock().then(toBigNumber)
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					const expected = toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
						.times(1e18)
						.times(block.minus(lastBlock))

					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after withdrawal', () => {
				let aliceBalance: BigNumber
				let aliceLocked: BigNumber
				before(async () => {
					aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
					aliceLocked = await dev.lockup
						.getValue(property.address, alice)
						.then(toBigNumber)
					await dev.lockup.withdraw(property.address, aliceLocked, {
						from: alice,
					})
				})
				it(`Alice's withdrawable interest is 100% of the Property's interest`, async () => {
					const block = await getBlock().then(toBigNumber)
					const aliceLockup = await dev.lockup
						.getValue(property.address, alice)
						.then(toBigNumber)
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					const afterAliceBalance = await dev.dev
						.balanceOf(alice)
						.then(toBigNumber)
					const reward = toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
						.times(1e18)
						.times(block.minus(lastBlock))
					expect(aliceAmount.toFixed()).to.be.equal('0')
					expect(aliceLockup.toFixed()).to.be.equal('0')
					expect(afterAliceBalance.toFixed()).to.be.equal(
						aliceBalance.plus(aliceLocked).plus(reward).toFixed()
					)
				})
			})
		})
		describe('scenario: multiple lockup', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let calc: Calculator

			const alice = deployer
			const bob = user1

			before(async () => {
				;[dev, property] = await init()
				calc = createCalculator(dev)
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
				await dev.dev.deposit(property.address, 10000, {from: alice})
			})

			describe('before second run', () => {
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
				it(`Alice's withdrawable interest is 100% of between lastBlockNumber and Bob's first deposit block interest and 80% of current interest`, async () => {
					await mine(3)
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					const expected = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Bob's withdrawable interest is 20% of interest since the first deposit`, async () => {
					await mine(3)
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)
					const expected = await calc(property, bob)
					expect(bobAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after second withdrawal', () => {
				before(async () => {
					await dev.lockup.withdraw(property.address, 0, {from: alice})
					await dev.lockup.withdraw(property.address, 0, {from: bob})
					await mine(3)
				})
				it(`Alice's withdrawable interest is 80% of current interest`, async () => {
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					const expected = await calc(property, alice)

					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Bob's withdrawable interest is 20% of current interest`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)
					const expected = await calc(property, bob)

					expect(bobAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('additional staking', () => {
				before(async () => {
					await dev.dev.deposit(property.address, 12500 * 0.3, {from: bob})
					await mine(3)
				})
				it(`Bob does staking 30% of the Property's total lockups, Bob's share become ${
					625000 / 16250
				}%, Alice's share become ${1000000 / 16250}%`, async () => {
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
				it(`Alice's withdrawable interest is 80% of prev interest and ${
					1000000 / 16250
				}% of current interest`, async () => {
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					const expected = await calc(property, alice)

					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Bob's withdrawable interest is 20% of prev interest and ${
					625000 / 16250
				}% of current interest`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)
					const expected = await calc(property, bob)

					expect(bobAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after withdrawal', () => {
				before(async () => {
					await dev.lockup.withdraw(
						property.address,
						await dev.lockup.getValue(property.address, alice),
						{
							from: alice,
						}
					)
					await mine(3)
					await dev.lockup.withdraw(
						property.address,
						await dev.lockup.getValue(property.address, bob),
						{
							from: bob,
						}
					)
					await mine(3)
				})
				it(`Alice's withdrawable interest is 0`, async () => {
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)

					expect(aliceAmount.toFixed()).to.be.equal('0')
				})
				it(`Bob's withdrawable interest is 0`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)

					expect(bobAmount.toFixed()).to.be.equal('0')
				})
			})
		})

		describe('scenario: multiple properties', () => {
			let dev: DevProtocolInstance
			let property1: PropertyInstance
			let property2: PropertyInstance
			let property3: PropertyInstance
			let property4: PropertyInstance
			let calc: Calculator

			const alice = deployer
			const bob = user1

			before(async () => {
				;[dev, property1] = await init()
				calc = createCalculator(dev)
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
				;[property2, property3, property4] = await Promise.all([
					artifacts
						.require('Property')
						.at(
							getPropertyAddress(
								await dev.propertyFactory.create('test2', 'TEST2', deployer)
							)
						),
					artifacts
						.require('Property')
						.at(
							getPropertyAddress(
								await dev.propertyFactory.create('test3', 'TEST3', deployer)
							)
						),
					artifacts
						.require('Property')
						.at(
							getPropertyAddress(
								await dev.propertyFactory.create('test4', 'TEST4', deployer)
							)
						),
				])
				await dev.metricsGroup.__setMetricsCountPerProperty(
					property2.address,
					1
				)
				await dev.metricsGroup.__setMetricsCountPerProperty(
					property3.address,
					1
				)
				await dev.metricsGroup.__setMetricsCountPerProperty(
					property4.address,
					1
				)

				await dev.dev.deposit(property1.address, 10000, {from: alice})
				await mine(3)
			})

			describe('before withdrawal', () => {
				it('No staked Property is 0 interest', async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property4.address, alice)
						.then(toBigNumber)
					const expected = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice does staking 100% of the Property1 total lockups, Property1 is 100% of the total rewards`, async () => {
					const total = await dev.lockup
						.getPropertyValue(property1.address)
						.then(toBigNumber)
					const aliceBalance = await dev.lockup
						.getValue(property1.address, alice)
						.then(toBigNumber)
					expect(aliceBalance.toFixed()).to.be.equal(total.toFixed())
				})
				it(`Bob does staking 100% of the Property2 total lockups, Property2 is 20% of the total rewards`, async () => {
					await dev.dev.deposit(property2.address, 2500, {from: bob})
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
				it(`Alice's withdrawable interest is 100% of between lastBlockNumber and Bob's first deposit block interest and 80% of current interest`, async () => {
					await mine(3)
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property1.address, alice)
						.then(toBigNumber)
					const expected = await calc(property1, alice)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Bob's withdrawable interest is 20% of interest since the first deposit`, async () => {
					await mine(3)
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property2.address, bob)
						.then(toBigNumber)
					const expected = await calc(property2, bob)
					expect(bobAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after withdrawal', () => {
				before(async () => {
					await dev.lockup.withdraw(property1.address, 0, {from: alice})
					await dev.lockup.withdraw(property2.address, 0, {from: bob})
					await mine(3)
				})
				it('No staked Property is 0 interest', async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property4.address, alice)
						.then(toBigNumber)
					const expected = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest is 80% of current interest`, async () => {
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property1.address, alice)
						.then(toBigNumber)
					const expected = await calc(property1, alice)

					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Bob's withdrawable interest is 20% of current interest`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property2.address, bob)
						.then(toBigNumber)
					const expected = await calc(property2, bob)

					expect(bobAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('additional staking', () => {
				before(async () => {
					await dev.dev.deposit(property2.address, 12500 * 0.3, {from: bob})
					await mine(3)
				})
				it('No staked Property is 0 interest', async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property4.address, alice)
						.then(toBigNumber)
					const expected = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Bob does staking 30% of the all Property's total lockups, Bob's share become ${
					625000 / 16250
				}%, Alice's share become ${1000000 / 16250}%`, async () => {
					const aliceBalance = await dev.lockup
						.getValue(property1.address, alice)
						.then(toBigNumber)
					const bobBalance = await dev.lockup
						.getValue(property2.address, bob)
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
				it('No staked Property is 0 interest', async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property4.address, alice)
						.then(toBigNumber)
					const expected = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest is 80% of prev interest and ${
					1000000 / 16250
				}% of current interest`, async () => {
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property1.address, alice)
						.then(toBigNumber)
					const expected = await calc(property1, alice)

					expect(aliceAmount.toFixed()).to.be.equal(
						expected.integerValue(BigNumber.ROUND_DOWN).toFixed()
					)
				})
				it(`Bob's withdrawable interest is 20% of prev interest and ${
					625000 / 16250
				}% of current interest`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property2.address, bob)
						.then(toBigNumber)
					const expected = await calc(property2, bob)

					expect(bobAmount.toFixed()).to.be.equal(
						expected.integerValue(BigNumber.ROUND_DOWN).toFixed()
					)
				})
			})
			describe('additional staking', () => {
				before(async () => {
					await dev.dev.deposit(property3.address, 16250 * 0.6, {from: alice})
					await mine(3)
				})
				it('No staked Property is 0 interest', async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property4.address, alice)
						.then(toBigNumber)
					const expected = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice does staking 60% of the all Property's total lockups, Alice's share become ${
					1975000 / 26000
				}%, Bob's share become ${625000 / 26000}%`, async () => {
					const aliceBalance = await Promise.all([
						dev.lockup.getValue(property1.address, alice).then(toBigNumber),
						dev.lockup.getValue(property3.address, alice).then(toBigNumber),
					])
					const bobBalance = await dev.lockup
						.getValue(property2.address, bob)
						.then(toBigNumber)

					expect(19750).to.be.equal(
						toBigNumber(26000).times(toBigNumber(19750).div(26000)).toNumber()
					)
					expect(aliceBalance[0].plus(aliceBalance[1]).toFixed()).to.be.equal(
						'19750'
					)
					expect(6250).to.be.equal(
						toBigNumber(26000).times(toBigNumber(6250).div(26000)).toNumber()
					)
					expect(bobBalance.toFixed()).to.be.equal('6250')
				})
			})
			describe('after additional staking', () => {
				it('No staked Property is 0 interest', async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property4.address, alice)
						.then(toBigNumber)
					const expected = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest is 80% of two prev interest and ${
					1000000 / 16250
				}% of prev interest and ${
					1975000 / 26000
				}% of current interest`, async () => {
					const aliceAmount = await Promise.all([
						dev.lockup
							.calculateWithdrawableInterestAmount(property1.address, alice)
							.then(toBigNumber),
						dev.lockup
							.calculateWithdrawableInterestAmount(property3.address, alice)
							.then(toBigNumber),
					])
					const res1 = await calc(property1, alice)
					const res2 = await calc(property3, alice)

					expect(aliceAmount[0].plus(aliceAmount[1]).toFixed()).to.be.equal(
						res1.plus(res2).toFixed()
					)
				})
				it(`Bob's withdrawable interest is 20% of two prev interest and ${
					625000 / 16250
				}% of prev interest and ${
					625000 / 26000
				}% of current interest`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property2.address, bob)
						.then(toBigNumber)
					const expected = await calc(property2, bob)

					expect(bobAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after withdrawal stakes', () => {
				before(async () => {
					await dev.lockup.withdraw(
						property1.address,
						await dev.lockup.getValue(property1.address, alice),
						{
							from: alice,
						}
					)
					await mine(3)
					await dev.lockup.withdraw(
						property3.address,
						await dev.lockup.getValue(property3.address, alice),
						{
							from: alice,
						}
					)
					await mine(3)
					await dev.lockup.withdraw(
						property2.address,
						await dev.lockup.getValue(property2.address, bob),
						{
							from: bob,
						}
					)
					await mine(3)
				})
				it('No staked Property is 0 interest', async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property4.address, alice)
						.then(toBigNumber)
					const expected = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest`, async () => {
					const aliceAmount = await Promise.all([
						dev.lockup
							.calculateWithdrawableInterestAmount(property1.address, alice)
							.then(toBigNumber),
						dev.lockup
							.calculateWithdrawableInterestAmount(property3.address, alice)
							.then(toBigNumber),
					])
					const res1 = await calc(property1, alice)
					const res2 = await calc(property3, alice)

					expect(aliceAmount[0].plus(aliceAmount[1]).toFixed()).to.be.equal(
						res1.plus(res2).toFixed()
					)
				})
				it(`Bob's withdrawable interest`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property2.address, bob)
						.then(toBigNumber)
					const expected = await calc(property2, bob)

					expect(bobAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
		})
		describe('scenario: fallback legacy locking-ups', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let property2: PropertyInstance
			let legacyPrice: BigNumber
			let lockedAlice: BigNumber
			let lockedBob: BigNumber
			let blockAlice: BigNumber
			let blockBob: BigNumber
			let legacyLastPriceAlice: BigNumber
			let legacyLastPriceBob: BigNumber
			let lastBlock: BigNumber
			let calc: Calculator
			const alice = deployer
			const bob = user1
			before(async () => {
				;[dev, property] = await init(false)
				;[property2] = await Promise.all([
					artifacts
						.require('Property')
						.at(
							getPropertyAddress(
								await dev.propertyFactory.create('test2', 'TEST2', alice)
							)
						),
				])
				await dev.metricsGroup.__setMetricsCountPerProperty(
					property2.address,
					1
				)

				calc = createCalculator(dev)
				await dev.dev.mint(bob, await dev.dev.balanceOf(alice))
				const legacyAmount = toBigNumber(1000).times(1e18)
				const totalLocked = toBigNumber(100000000)
				lockedAlice = totalLocked.times(0.8)
				lockedBob = totalLocked.times(0.2)
				legacyPrice = legacyAmount.times(1e18).div(totalLocked)
				legacyLastPriceAlice = legacyPrice.div(4)
				legacyLastPriceBob = legacyPrice.div(2)
				await dev.dev.transfer(property.address, lockedAlice, {from: alice})
				await dev.dev.transfer(property.address, lockedBob, {from: bob})

				await dev.lockup.changeOwner(deployer)
				const storage = await dev.lockup
					.getStorageAddress()
					.then((x) => artifacts.require('EternalStorage').at(x))
				await storage.setUint(keccak256('_allValue'), totalLocked)
				await storage.setUint(
					keccak256('_value', property.address, alice),
					lockedAlice
				)
				await storage.setUint(
					keccak256('_value', property.address, bob),
					lockedBob
				)
				await storage.setUint(
					keccak256('_propertyValue', property.address),
					totalLocked
				)
				await storage.setUint(keccak256('_allValue'), totalLocked)
				await storage.setUint(
					keccak256('_interestTotals', property.address),
					legacyPrice
				)
				await storage.setUint(
					keccak256('_lastLastInterestPrice', property.address, alice),
					legacyLastPriceAlice
				)
				await storage.setUint(
					keccak256('_lastLastInterestPrice', property.address, bob),
					legacyLastPriceBob
				)
				await storage.changeOwner(dev.lockup.address)

				await dev.lockup.update()
				lastBlock = await getBlock().then(toBigNumber)
				await mine(1)
			})
			describe('before withdraw interest', () => {
				it('No staked Property is 0 interest', async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property2.address, alice)
						.then(toBigNumber)
					const expected = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const block = await getBlock().then(toBigNumber)
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					const latest = toBigNumber(10)
						.times(1e18)
						.times(8)
						.div(10)
						.times(block.minus(lastBlock))
					const legacy = lockedAlice
						.times(legacyPrice.minus(legacyLastPriceAlice))
						.div(1e18)
					const expected = await calc(property, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(latest.plus(legacy).toFixed()).to.be.equal(result.toFixed())
				})
				it(`Bob's withdrawable interest is correct`, async () => {
					const block = await getBlock().then(toBigNumber)
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)
					const latest = toBigNumber(10)
						.times(1e18)
						.times(2)
						.div(10)
						.times(block.minus(lastBlock))
					const legacy = lockedBob
						.times(legacyPrice.minus(legacyLastPriceBob))
						.div(1e18)
					const expected = await calc(property, bob)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(latest.plus(legacy).toFixed()).to.be.equal(result.toFixed())
				})
			})
			describe('after withdraw interest', () => {
				let lastBlockAlice: BigNumber
				let lastBlockBob: BigNumber
				before(async () => {
					await dev.lockup.withdraw(property.address, 0, {from: alice})
					lastBlockAlice = await getBlock().then(toBigNumber)
					blockAlice = lastBlockAlice
					await dev.lockup.withdraw(property.address, 0, {from: bob})
					lastBlockBob = await getBlock().then(toBigNumber)
					blockBob = lastBlockBob
					await mine(3)
				})
				it('No staked Property is 0 interest', async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property2.address, alice)
						.then(toBigNumber)
					const expected = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const block = await getBlock().then(toBigNumber)
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					const expected = toBigNumber(10)
						.times(1e18)
						.times(block.minus(lastBlockAlice))
						.times(0.8)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Bob's withdrawable interest is correct`, async () => {
					const block = await getBlock().then(toBigNumber)
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)
					const expected = toBigNumber(10)
						.times(1e18)
						.times(block.minus(lastBlockBob))
						.times(0.2)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after withdraw', () => {
				let lastBlockAlice: BigNumber
				let lastBlockBob: BigNumber
				let aliceBalance: BigNumber
				let bobBalance: BigNumber
				let aliceLocked: BigNumber
				let bobLocked: BigNumber
				before(async () => {
					aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
					aliceLocked = await dev.lockup
						.getValue(property.address, alice)
						.then(toBigNumber)

					await dev.lockup.withdraw(property.address, aliceLocked, {
						from: alice,
					})
					lastBlockAlice = await getBlock().then(toBigNumber)
					bobBalance = await dev.dev.balanceOf(bob).then(toBigNumber)
					bobLocked = await dev.lockup
						.getValue(property.address, bob)
						.then(toBigNumber)
					await dev.lockup.withdraw(property.address, bobLocked, {from: bob})
					lastBlockBob = await getBlock().then(toBigNumber)
					await mine(3)
				})
				it('No staked Property is 0 interest', async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property2.address, alice)
						.then(toBigNumber)
					const expected = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					const afterAliceBalance = await dev.dev
						.balanceOf(alice)
						.then(toBigNumber)
					const reward = toBigNumber(10)
						.times(1e18)
						.times(lastBlockAlice.minus(blockAlice))
						.times(0.8)
					expect(result.toFixed()).to.be.equal('0')
					expect(afterAliceBalance.toFixed()).to.be.equal(
						aliceBalance.plus(aliceLocked).plus(reward).toFixed()
					)
				})
				it(`Bob's withdrawable interest is correct`, async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)
					const afterBobBalance = await dev.dev.balanceOf(bob).then(toBigNumber)
					const reward = toBigNumber(10)
						.times(1e18)
						.times(lastBlockBob.minus(1).minus(blockBob))
						.times(0.2)
						.plus(toBigNumber(10).times(1e18))
					expect(result.toFixed()).to.be.equal('0')
					expect(afterBobBalance.toFixed()).to.be.equal(
						bobBalance.plus(bobLocked).plus(reward).toFixed()
					)
				})
			})
		})
		describe('scenario: fallback legacy locking-ups and latest locking-ups', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let property2: PropertyInstance
			let legacyPrice: BigNumber
			let lockedAlice: BigNumber
			let lockedBob: BigNumber
			let blockAlice: BigNumber
			let legacyLastPriceAlice: BigNumber
			let legacyLastPriceBob: BigNumber
			let calc: Calculator
			const alice = deployer
			const bob = user1
			before(async () => {
				;[dev, property] = await init()
				;[property2] = await Promise.all([
					artifacts
						.require('Property')
						.at(
							getPropertyAddress(
								await dev.propertyFactory.create('test2', 'TEST2', alice)
							)
						),
				])
				await dev.metricsGroup.__setMetricsCountPerProperty(
					property2.address,
					1
				)

				calc = createCalculator(dev)
				await dev.dev.mint(bob, await dev.dev.balanceOf(alice))
				const legacyAmount = toBigNumber(1000).times(1e18)
				const totalLocked = toBigNumber(100000000)
				lockedAlice = totalLocked.times(0.8)
				lockedBob = totalLocked.times(0.2)
				legacyPrice = legacyAmount.times(1e18).div(totalLocked)
				legacyLastPriceAlice = legacyPrice.div(4)
				legacyLastPriceBob = legacyPrice.div(2)
				await dev.dev.transfer(property.address, lockedAlice, {from: alice})
				await dev.dev.transfer(property.address, lockedBob, {from: bob})
				await dev.lockup.changeOwner(deployer)
				const storage = await dev.lockup
					.getStorageAddress()
					.then((x) => artifacts.require('EternalStorage').at(x))
				await storage.setUint(keccak256('_allValue'), totalLocked)
				await storage.setUint(
					keccak256('_value', property.address, alice),
					lockedAlice
				)
				await storage.setUint(
					keccak256('_value', property.address, bob),
					lockedBob
				)
				await storage.setUint(
					keccak256('_propertyValue', property.address),
					totalLocked
				)
				await storage.setUint(keccak256('_allValue'), totalLocked)
				await storage.setUint(
					keccak256('_interestTotals', property.address),
					legacyPrice
				)
				await storage.setUint(
					keccak256('_lastLastInterestPrice', property.address, alice),
					legacyLastPriceAlice
				)
				await storage.setUint(
					keccak256('_lastLastInterestPrice', property.address, bob),
					legacyLastPriceBob
				)
				await storage.changeOwner(dev.lockup.address)

				await dev.dev.deposit(property.address, 200000000, {from: alice})
				blockAlice = await getBlock().then(toBigNumber)
				await dev.dev.deposit(property.address, 100000000, {from: bob})
				await mine(10)
			})
			describe('before withdraw interest', () => {
				it('No staked Property is 0 interest', async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property2.address, alice)
						.then(toBigNumber)
					const expected = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					const expected = await calc(property, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Bob's withdrawable interest is correct`, async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)
					const expected = await calc(property, bob)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after withdraw interest', () => {
				let lastBlockAlice: BigNumber
				let lastBlockBob: BigNumber
				before(async () => {
					await dev.lockup.withdraw(property.address, 0, {from: alice})
					lastBlockAlice = await getBlock().then(toBigNumber)
					blockAlice = lastBlockAlice
					await dev.lockup.withdraw(property.address, 0, {from: bob})
					lastBlockBob = await getBlock().then(toBigNumber)
					await mine(3)
				})
				it('No staked Property is 0 interest', async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property2.address, alice)
						.then(toBigNumber)
					const expected = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const block = await getBlock().then(toBigNumber)
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					const expected = toBigNumber(10)
						.times(1e18)
						.times(block.minus(lastBlockAlice))
						.times((100000000 * 0.8 + 200000000) / 400000000)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Bob's withdrawable interest is correct`, async () => {
					const block = await getBlock().then(toBigNumber)
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)
					const expected = toBigNumber(10)
						.times(1e18)
						.times(block.minus(lastBlockBob))
						.times((100000000 * 0.2 + 100000000) / 400000000)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after withdraw', () => {
				let lastBlockAlice: BigNumber
				before(async () => {
					await dev.lockup.withdraw(
						property.address,
						await dev.lockup.getValue(property.address, alice),
						{from: alice}
					)
					lastBlockAlice = await getBlock().then(toBigNumber)
					await dev.lockup.withdraw(
						property.address,
						await dev.lockup.getValue(property.address, bob),
						{from: bob}
					)
					await mine(3)
				})
				it('No staked Property is 0 interest', async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property2.address, alice)
						.then(toBigNumber)
					const expected = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
					expect(expected.toFixed()).to.be.equal('0')
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					const expected = toBigNumber(10)
						.times(1e18)
						.times(lastBlockAlice.minus(blockAlice))
						.times((100000000 * 0.8 + 200000000) / 400000000)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Bob's withdrawable interest is correct`, async () => {
					const result = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)
					const expected = await calc(property, bob)
					expect(result.toFixed()).to.be.equal(expected.toFixed())
				})
			})
		})
	})
	describe('Lockup; setDIP4GenesisBlock', () => {
		it('Store passed value to getStorageDIP4GenesisBlock as a block number', async () => {
			const [dev] = await init()
			const stored = await dev.lockup.getStorageDIP4GenesisBlock()
			expect(stored.toNumber()).to.be.greaterThan(1)
		})
		it('Should fail to call when already updated the value', async () => {
			const [dev] = await init()
			const res = await dev.lockup.setDIP4GenesisBlock(456789).catch(err)
			const stored = await dev.lockup.getStorageDIP4GenesisBlock()
			expect(stored.toNumber()).to.be.greaterThan(1)
			expect(res).to.be.instanceOf(Error)
		})
		it('Should fail to call when sent from non-pauser account', async () => {
			const [dev] = await init()
			const before = await dev.lockup
				.getStorageDIP4GenesisBlock()
				.then(toBigNumber)
			const res = await dev.lockup
				.setDIP4GenesisBlock(before.plus(123456), {from: user1})
				.catch(err)
			const after = await dev.lockup.getStorageDIP4GenesisBlock()
			expect(after.toNumber()).to.be.equal(before.toNumber())
			expect(res).to.be.instanceOf(Error)
		})
	})
})
