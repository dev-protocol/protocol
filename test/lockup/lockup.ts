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
import {getWithdrawInterestAmount} from '../test-lib/utils/mint-amount'
import {getPropertyAddress} from '../test-lib/utils/log'
import {waitForEvent, getEventValue} from '../test-lib/utils/event'
import {validateErrorMessage} from '../test-lib/utils/error'
import {WEB3_URI} from '../test-lib/const'

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
			dev.generateWithdrawStorage(),
			dev.generatePropertyFactory(),
			dev.generatePropertyGroup(),
			dev.generateVoteCounter(),
			dev.generatePolicyFactory(),
			dev.generatePolicyGroup(),
			dev.generatePolicySet(),
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
		await dev.metricsGroup.addGroup(deployer)

		await dev.dev.addMinter(dev.lockup.address)
		if (initialUpdate) {
			await dev.lockup.update()
		}

		return [dev, property, policy]
	}

	const err = (error: Error): Error => error

	describe('Lockup; cancel', () => {
		it('An error occurs if you specify something other than a property address.', async () => {
			const [dev, ,] = await init()
			const res = await dev.lockup.cancel(user1).catch(err)
			validateErrorMessage(res, 'this is illegal address')
		})
		it('An error occurs when specifying a property address that is not locked up.', async () => {
			const [dev, property] = await init()
			const res = await dev.lockup.cancel(property.address).catch(err)
			validateErrorMessage(res, 'dev token is not locked')
		})
		it('An error will occur if not locked up.', async () => {
			const [dev, property] = await init()
			const res = await dev.lockup.cancel(property.address).catch(err)
			validateErrorMessage(res, 'dev token is not locked')
		})
		it('Cannot be canceled during cancellation.', async () => {
			const [dev, property] = await init()
			await dev.dev.deposit(property.address, 10000)
			await dev.lockup.cancel(property.address)
			const res = await dev.lockup.cancel(property.address).catch(err)
			validateErrorMessage(res, 'lockup is already canceled')
		})
		it('If you stand for a certain time after canceling, withdraw ends normally.', async () => {
			const [dev, property] = await init()
			await dev.dev.deposit(property.address, 10000)
			await dev.lockup.cancel(property.address)
			await mine(1)
			await dev.lockup.withdraw(property.address)
		})
		it('Cannot be canceled after withdraw ends normally.', async () => {
			const [dev, property] = await init()
			await dev.dev.deposit(property.address, 10000)
			await dev.lockup.cancel(property.address)
			await mine(1)
			await dev.lockup.withdraw(property.address)
			const res = await dev.lockup.cancel(property.address).catch(err)
			validateErrorMessage(res, 'dev token is not locked')
		})
	})
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

			const res = await dev.lockup.lockup(deployer, user1, 10000).catch(err)
			validateErrorMessage(res, 'this is illegal address')
		})
		it('should fail to call when lockup is canceling', async () => {
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
				.lockup(deployer, property.address, 10000)
				.catch(err)
			validateErrorMessage(res, 'lockup is already canceled')
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
		it('record transferred token as a lockup', async () => {
			const [dev, property] = await init()

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
			const [dev, property] = await init()

			await dev.dev.deposit(property.address, 10000).catch(err)
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
			const [dev, property] = await init()

			const res = await dev.lockup.withdraw(property.address).catch(err)
			validateErrorMessage(res, 'waiting for release')
		})
		it('should fail to call when dev token is not locked', async () => {
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

			const res = await dev.lockup.withdraw(property.address).catch(err)
			validateErrorMessage(res, 'dev token is not locked')
		})
		it(`withdrawing sender's withdrawable full amount`, async () => {
			const [dev, property] = await init()
			const beforeBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			await dev.dev.deposit(property.address, 10000)
			let lockedupAllAmount = await dev.lockup.getAllValue().then(toBigNumber)
			expect(lockedupAllAmount.toFixed()).to.be.equal('10000')
			await dev.lockup.changeOwner(deployer)
			const storage = await dev.lockup
				.getStorageAddress()
				.then((x) => artifacts.require('EternalStorage').at(x))
			await storage.setUint(
				keccak256('_withdrawalStatus', property.address, deployer),
				1
			)
			await storage.changeOwner(dev.lockup.address)

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
		// Patch for DIP3
		it('should fail to withdraw when not enable DIP3 and block is small', async () => {
			const [dev, property, policy] = await init()
			const beforeBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			// Disable DIP3
			await policy.setLockUpBlocks(10)

			await dev.dev.deposit(property.address, 10000)
			await dev.lockup.cancel(property.address)
			const res = await dev.lockup.withdraw(property.address).catch(err)

			const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			expect(afterBalance.toFixed()).to.be.equal(
				beforeBalance.minus(10000).toFixed()
			)
			expect(afterTotalSupply.toFixed()).to.be.equal(
				beforeTotalSupply.toFixed()
			)
			validateErrorMessage(res, 'waiting for release')
		})
		it('can withdraw when enabling DIP3', async () => {
			const [dev, property, policy] = await init()
			const beforeBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			// Disable DIP3
			await policy.setLockUpBlocks(10)

			await dev.dev.deposit(property.address, 10000)

			// Enable DIP3
			await policy.setLockUpBlocks(1)

			await dev.lockup.cancel(property.address)
			await dev.lockup.withdraw(property.address)

			const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			expect(afterBalance.toFixed()).to.be.equal(beforeBalance.toFixed())
			expect(afterTotalSupply.toFixed()).to.be.equal(
				beforeTotalSupply.toFixed()
			)
		})
	})
	describe('Lockup; getCumulativeLockedUp, getCumulativeLockedUpAll', () => {
		let dev: DevProtocolInstance
		let property: PropertyInstance
		let property2: PropertyInstance
		let property3: PropertyInstance

		beforeEach(async () => {
			;[dev, property] = await init()
			;[property2, property3] = await Promise.all([
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
			])
		})

		it('getCumulativeLockedUp returns cumulative sum of locking-ups on the Property', async () => {
			await dev.dev.deposit(property.address, 123456)
			await mine(3)
			await dev.dev.deposit(property.address, 67890)
			await mine(5)
			await dev.lockup.cancel(property.address)
			await dev.lockup.withdraw(property.address)
			await mine(7)
			const result = await dev.lockup
				.getCumulativeLockedUp(property.address)
				.then((x) => toBigNumber(x[0]))
			const expected =
				0 + 123456 + 123456 * (3 + 1) + 67890 + (123456 + 67890) * (5 + 1)
			expect(result.toNumber()).to.be.equal(expected)
		})
		it('getCumulativeLockedUp returns cumulative sum of locking-ups on the Property from PropertyValue when the last block is 0', async () => {
			await dev.dev.transfer(property.address, 6457)

			await dev.lockup.changeOwner(deployer)
			const storage = await dev.lockup
				.getStorageAddress()
				.then((x) => artifacts.require('EternalStorage').at(x))
			await storage.setUint(keccak256('_allValue'), 6457)
			await storage.setUint(keccak256('_propertyValue', property.address), 6457)
			await storage.setUint(
				keccak256('_value', property.address, deployer),
				6457
			)
			await storage.changeOwner(dev.lockup.address)

			const block = await getBlock().then(toBigNumber)
			await dev.dev.deposit(property.address, 123456)
			await mine(3)
			await dev.dev.deposit(property.address, 67890)
			await mine(5)
			await dev.lockup.cancel(property.address)
			await dev.lockup.withdraw(property.address)
			await mine(7)
			const result = await dev.lockup
				.getCumulativeLockedUp(property.address)
				.then((x) => toBigNumber(x[0]))
			const deployedBlock = await dev.lockup
				.getStorageDIP4GenesisBlock()
				.then(toBigNumber)
			const expected =
				0 +
				6457 +
				6457 * (block.toNumber() - deployedBlock.toNumber()) +
				123456 +
				(6457 + 123456) * (3 + 1) +
				67890 +
				(6457 + 123456 + 67890) * (5 + 1)

			expect(result.toNumber()).to.be.equal(expected)
		})
		it('getCumulativeLockedUpAll returns cumulative sum of total locking-ups on the protocol', async () => {
			await dev.dev.deposit(property.address, 123456)
			await mine(3)
			await dev.dev.deposit(property2.address, 67890)
			await mine(5)
			await dev.dev.deposit(property3.address, 463578)
			await mine(7)
			await dev.lockup.cancel(property.address)
			await dev.lockup.withdraw(property.address)
			await mine(2)
			await dev.lockup.cancel(property2.address)
			await dev.lockup.withdraw(property2.address)
			await mine(2)
			await dev.lockup.cancel(property3.address)
			await dev.lockup.withdraw(property3.address)
			await mine(7)
			const result = await dev.lockup
				.getCumulativeLockedUpAll()
				.then((x) => toBigNumber(x[0]))
			const expected =
				0 +
				123456 +
				123456 * (3 + 1) +
				67890 +
				(123456 + 67890) * (5 + 1) +
				463578 +
				(123456 + 463578 + 67890) * (7 + 2) -
				123456 +
				(463578 + 67890) * (2 + 2) -
				67890 +
				463578 * (2 + 2) -
				463578

			expect(result.toNumber()).to.be.equal(expected)
		})
		it('getCumulativeLockedUpAll returns cumulative sum of total locking-ups on the protocol from AllValue when the last block is 0', async () => {
			await dev.dev.transfer(property.address, 5475)

			await dev.lockup.changeOwner(deployer)
			const storage = await dev.lockup
				.getStorageAddress()
				.then((x) => artifacts.require('EternalStorage').at(x))
			await storage.setUint(keccak256('_allValue'), 5475)
			await storage.setUint(keccak256('_propertyValue', property.address), 5475)
			await storage.setUint(
				keccak256('_value', property.address, deployer),
				5475
			)
			await storage.changeOwner(dev.lockup.address)

			const block = await getBlock().then(toBigNumber)
			await dev.dev.deposit(property.address, 123456)
			await mine(3)
			await dev.dev.deposit(property2.address, 67890)
			await mine(5)
			await dev.dev.deposit(property3.address, 463578)
			await mine(7)
			await dev.lockup.cancel(property.address)
			await dev.lockup.withdraw(property.address)
			await mine(2)
			await dev.lockup.cancel(property2.address)
			await dev.lockup.withdraw(property2.address)
			await mine(2)
			await dev.lockup.cancel(property3.address)
			await dev.lockup.withdraw(property3.address)
			await mine(7)
			const result = await dev.lockup
				.getCumulativeLockedUpAll()
				.then((x) => toBigNumber(x[0]))
			const deployedBlock = await dev.lockup
				.getStorageDIP4GenesisBlock()
				.then(toBigNumber)
			const expected =
				0 +
				5475 +
				5475 * (block.toNumber() - deployedBlock.toNumber()) +
				123456 +
				(5475 + 123456) * (3 + 1) +
				67890 +
				(5475 + 123456 + 67890) * (5 + 1) +
				463578 +
				(5475 + 123456 + 67890 + 463578) * (7 + 2) -
				(5475 + 123456) +
				(67890 + 463578) * (2 + 2) -
				67890 +
				463578 * (2 + 2) -
				463578

			expect(result.toNumber()).to.be.equal(expected)
		})
	})
	describe('Lockup; calculateWithdrawableInterestAmount', () => {
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
				dev.allocator.calculateMaxRewardsPerBlock(),
				dev.lockup
					.getStorageLastSameRewardsAmountAndBlock()
					.then((x: any) => x[0]),
				dev.lockup
					.getStorageLastSameRewardsAmountAndBlock()
					.then((x: any) => x[1]),
				dev.lockup.getStorageDIP4GenesisBlock(),
				getBlock(),
				dev.lockup.getStorageCumulativeGlobalRewards(),
				dev.lockup.getPropertyValue(prop.address),
				dev.lockup.getValue(prop.address, account),
				dev.lockup.getStorageLastCumulativeGlobalReward(prop.address, account),
				dev.lockup.getCumulativeLockedUp(prop.address).then((x) => x[0]),
				dev.lockup.getCumulativeLockedUpAll().then((x) => x[0]),
				dev.lockup.getStoragePendingInterestWithdrawal(prop.address, account),
				dev.lockup.getStorageInterestPrice(prop.address),
				dev.lockup.getStorageLastInterestPrice(prop.address, account),
				dev.lockup
					.getStorageLastCumulativeLockedUpAndBlock(prop.address, account)
					.then((x) => x[0]),
				dev.lockup
					.getStorageLastCumulativeLockedUpAndBlock(prop.address, account)
					.then((x) => x[1]),
			]).then((results) => {
				const [
					maxRewards,
					lastRewardsAmount,
					lastBlock,
					deployedBlock,
					currentBlock,
					globalRewards,
					lockedUpPerProperty,
					lockedUpPerUser,
					last,
					cumulativeLockedUp,
					cumulativeLockedUpAll,
					pending,
					legacyInterestPrice,
					legacyInterestPricePerUser,
					lastCLocked,
					lastLockupBlock,
				] = results.map(toBigNumber)
				const rewards = (maxRewards.isEqualTo(lastRewardsAmount)
					? maxRewards
					: lastRewardsAmount
				)
					.times(
						currentBlock.minus(
							lastBlock.isGreaterThan(0) ? lastBlock : currentBlock
						)
					)
					.plus(globalRewards)
				const shareOfProperty = cumulativeLockedUp
					.times(1e36)
					.div(cumulativeLockedUpAll)
					.integerValue(BigNumber.ROUND_DOWN)
				const propertyRewards = rewards
					.minus(last)
					.times(shareOfProperty)
					.integerValue(BigNumber.ROUND_DOWN)
				// const propertyRewards = rewards.times(shareOfProperty)
				const interest = propertyRewards.times(10).div(100)
				const interestPrice = lockedUpPerProperty.isGreaterThan(0)
					? interest.div(lockedUpPerProperty)
					: toBigNumber(0)
				const share =
					lockedUpPerUser.isGreaterThan(0) &&
					lockedUpPerUser.isEqualTo(lockedUpPerProperty)
						? toBigNumber(1e18)
						: lockedUpPerUser.isEqualTo(0)
						? toBigNumber(0)
						: lockedUpPerUser
								.times(
									currentBlock.minus(
										lastLockupBlock.isEqualTo(0) && last.isGreaterThan(0)
											? last
													.times(1e18)
													.div(rewards)
													.times(
														currentBlock
															.minus(deployedBlock)
															.div(1e18)
															.plus(deployedBlock)
													)
											: lastLockupBlock.isEqualTo(0)
											? deployedBlock
											: 0
									)
								)
								.integerValue(BigNumber.ROUND_DOWN)
								.times(1e18)
								.div(cumulativeLockedUp.minus(lastCLocked))
								.integerValue(BigNumber.ROUND_DOWN)
				// const amount = interestPrice.times(lockedUpPerUser).div(1e36)
				const amount = interest.times(share).div(1e18).div(1e18).div(1e18)
				const legacyValue = legacyInterestPrice
					.minus(legacyInterestPricePerUser)
					.times(lockedUpPerUser)
					.div(1e18)
				const withdrawable = amount.plus(pending).plus(legacyValue)
				const res = withdrawable.integerValue(BigNumber.ROUND_DOWN)
				if (debug) {
					console.log(results.map(toBigNumber))
					console.log('deployedBlock', deployedBlock.toFixed())
					console.log('rewards', rewards.toFixed())
					console.log('shareOfProperty', shareOfProperty.toFixed())
					console.log('propertyRewards', propertyRewards.toFixed())
					console.log('interest', interest.toFixed())
					console.log('interestPrice', interestPrice.toFixed())
					console.log('share', share.toFixed())
					console.log('amount', amount.toFixed())
					console.log('legacyValue', legacyValue.toFixed())
					console.log('withdrawable', withdrawable.toFixed())
					console.log('res', res.toFixed())

					console.log(
						last.toFixed(),
						lastCLocked.toFixed(),
						currentBlock.toFixed(),
						lastLockupBlock.toFixed(),
						lockedUpPerUser.toFixed(),
						cumulativeLockedUp.toFixed(),
						cumulativeLockedUpAll.toFixed()
					)
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
			it('Alice has a 50% of interests', async () => {
				await dev.dev
					.deposit(property.address, 1000000000000, {from: bob})
					.then(gasLogger)
				await dev.lockup.withdrawInterest(property.address, {from: alice})
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
				await dev.lockup.withdrawInterest(property.address, {from: alice})
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
				const cLocked = await dev.lockup
					.getCumulativeLockedUp(property.address)
					.then((x) => toBigNumber(x[0]))
				const expected = toBigNumber(10)
					.times(1e18)
					.times(10)
					.minus(toBigNumber(10).times(1e18).times(4))
					.times(
						toBigNumber(1000000000000)
							.times(6)
							.div(cLocked.minus(toBigNumber(1000000000000).times(3)))
					)
				const calculated = await calc(property, bob)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated.toFixed())
			})
			it('Bob has a 25% of interests', async () => {
				await dev.lockup.withdrawInterest(property.address, {from: bob})
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
				await dev.lockup.withdrawInterest(property.address, {from: alice})
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
					await dev.lockup.withdrawInterest(property.address, {from: alice})
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
				before(async () => {
					await dev.lockup.cancel(property.address, {from: alice})
					await dev.lockup.withdraw(property.address, {
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
					const expected = toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
						.times(1e18)
						.times(block.minus(lastBlock))
					expect(aliceLockup.toFixed()).to.be.equal('0')
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
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
					await dev.lockup.withdrawInterest(property.address, {from: alice})
					await dev.lockup.withdrawInterest(property.address, {from: bob})
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
					await dev.lockup.cancel(property.address, {from: alice})
					await dev.lockup.cancel(property.address, {from: bob})
					await dev.lockup.withdraw(property.address, {
						from: alice,
					})
					await mine(3)
					await dev.lockup.withdraw(property.address, {
						from: bob,
					})
					await mine(3)
				})
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
				}% before interest withdrawal by Alice and 100% current interest`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)
					const expected = await calc(property, bob)

					expect(bobAmount.toFixed()).to.be.equal(expected.toFixed())
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
					await dev.lockup.withdrawInterest(property1.address, {from: alice})
					await dev.lockup.withdrawInterest(property2.address, {from: bob})
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
					await dev.lockup.cancel(property1.address, {from: alice})
					await dev.lockup.cancel(property2.address, {from: bob})
					await dev.lockup.cancel(property3.address, {from: alice})
					await dev.lockup.withdraw(property1.address, {
						from: alice,
					})
					await mine(3)
					await dev.lockup.withdraw(property3.address, {
						from: alice,
					})
					await mine(3)
					await dev.lockup.withdraw(property2.address, {
						from: bob,
					})
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
			let legacyLastPriceAlice: BigNumber
			let legacyLastPriceBob: BigNumber
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
					await dev.lockup.withdrawInterest(property.address, {from: alice})
					lastBlockAlice = await getBlock().then(toBigNumber)
					blockAlice = lastBlockAlice
					await dev.lockup.withdrawInterest(property.address, {from: bob})
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
				before(async () => {
					await dev.lockup.cancel(property.address, {from: alice})
					await dev.lockup.withdraw(property.address, {from: alice})
					lastBlockAlice = await getBlock().then(toBigNumber)
					await dev.lockup.cancel(property.address, {from: bob})
					await dev.lockup.withdraw(property.address, {from: bob})
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
						.times(0.8)
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
					await dev.lockup.withdrawInterest(property.address, {from: alice})
					lastBlockAlice = await getBlock().then(toBigNumber)
					blockAlice = lastBlockAlice
					await dev.lockup.withdrawInterest(property.address, {from: bob})
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
					await dev.lockup.cancel(property.address, {from: alice})
					await dev.lockup.withdraw(property.address, {from: alice})
					lastBlockAlice = await getBlock().then(toBigNumber)
					await dev.lockup.cancel(property.address, {from: bob})
					await dev.lockup.withdraw(property.address, {from: bob})
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
	describe('Lockup; withdrawInterest', () => {
		it('should fail to call when passed address is not property contract', async () => {
			const [dev] = await init()

			const res = await dev.lockup.withdrawInterest(deployer).catch(err)
			validateErrorMessage(res, 'this is illegal address')
		})
		it(`should fail to call when hasn't withdrawable interest amount`, async () => {
			const [dev, property] = await init()

			const res = await dev.lockup.withdrawInterest(property.address).catch(err)
			validateErrorMessage(res, 'your interest amount is 0')
		})
		describe('withdrawing interest amount', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance

			before(async () => {
				;[dev, property] = await init()
				await dev.dev.deposit(property.address, 10000)
			})

			it(`withdrawing sender's withdrawable interest full amount`, async () => {
				const beforeBalance = await dev.dev
					.balanceOf(deployer)
					.then(toBigNumber)
				const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)
				await mine(10)
				const amount = await dev.lockup
					.calculateWithdrawableInterestAmount(property.address, deployer)
					.then(toBigNumber)

				await dev.lockup.withdrawInterest(property.address)
				const realAmount = await getWithdrawInterestAmount(
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
				const amount = await dev.lockup
					.calculateWithdrawableInterestAmount(property.address, deployer)
					.then(toBigNumber)
				expect(amount.toFixed()).to.be.equal('0')
			})
		})
	})
	describe('Lockup; setDIP4GenesisBlock', () => {
		it('Store passed value to getStorageDIP4GenesisBlock as a block number', async () => {
			const [dev] = await init()
			await dev.lockup.setDIP4GenesisBlock(123456)
			const stored = await dev.lockup.getStorageDIP4GenesisBlock()
			expect(stored.toNumber()).to.be.equal(123456)
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
	describe('Lockup; initializeStatesAtLockup', () => {
		it('Store passed value to getStorageLastCumulativeGlobalReward and getStorageLastLockupStates', async () => {
			const [dev, property] = await init()
			await dev.lockup.initializeStatesAtLockup(
				property.address,
				user1,
				123,
				456,
				789
			)
			const rewards = await dev.lockup.getStorageLastCumulativeGlobalReward(
				property.address,
				user1
			)
			await dev.lockup
				.getStorageLastCumulativeLockedUpAndBlock(property.address, user1)
				.catch((err) => {
					console.log(1, err)
				})
			const cLockBlock: any = await dev.lockup.getStorageLastCumulativeLockedUpAndBlock(
				property.address,
				user1
			)
			expect(rewards.toNumber()).to.be.equal(123)
			expect(cLockBlock._cLocked.toNumber()).to.be.equal(456)
			expect(cLockBlock._block.toNumber()).to.be.equal(789)
		})
		it('Should not override when already any value ', async () => {
			const [dev, property] = await init()
			await dev.lockup.initializeStatesAtLockup(
				property.address,
				user1,
				123,
				456,
				789
			)
			await dev.lockup.initializeStatesAtLockup(
				property.address,
				user1,
				1230,
				4560,
				7890
			)
			const rewards = await dev.lockup.getStorageLastCumulativeGlobalReward(
				property.address,
				user1
			)
			const cLockBLock: any = await dev.lockup.getStorageLastCumulativeLockedUpAndBlock(
				property.address,
				user1
			)
			expect(rewards.toNumber()).to.be.equal(123)
			expect(cLockBLock._cLocked.toNumber()).to.be.equal(456)
			expect(cLockBLock._block.toNumber()).to.be.equal(789)
		})
		it('Should fail to call when sent from non-pauser account', async () => {
			const [dev, property] = await init()
			const beforeRewards = await dev.lockup.getStorageLastCumulativeGlobalReward(
				property.address,
				user1
			)
			const beforeCLockBlock: any = await dev.lockup.getStorageLastCumulativeLockedUpAndBlock(
				property.address,
				user1
			)
			const res = await dev.lockup
				.initializeStatesAtLockup(property.address, user1, 123, 456, 789, {
					from: user1,
				})
				.catch(err)
			const afterRewards = await dev.lockup.getStorageLastCumulativeGlobalReward(
				property.address,
				user1
			)
			const afterCLockBlock: any = await dev.lockup.getStorageLastCumulativeLockedUpAndBlock(
				property.address,
				user1
			)
			expect(afterRewards.toNumber()).to.be.equal(beforeRewards.toNumber())
			expect(afterCLockBlock._cLocked.toNumber()).to.be.equal(
				beforeCLockBlock._cLocked.toNumber()
			)
			expect(afterCLockBlock._block.toNumber()).to.be.equal(
				beforeCLockBlock._block.toNumber()
			)
			expect(res).to.be.instanceOf(Error)
		})
	})
})
