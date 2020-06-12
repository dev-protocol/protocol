/* eslint-disable @typescript-eslint/no-unused-vars */
import {DevProtocolInstance} from '../test-lib/instance'
import {
	PropertyInstance,
	PolicyTestForLockupInstance,
} from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import {mine, toBigNumber, getBlock} from '../test-lib/utils/common'
import {getPropertyAddress, getMarketAddress} from '../test-lib/utils/log'
import {waitForEvent, getEventValue, watch} from '../test-lib/utils/event'
import {
	validateErrorMessage,
	validatePauseErrorMessage,
} from '../test-lib/utils/error'
import {WEB3_URI} from '../test-lib/const'
import {config} from 'process'
import {alias} from 'commander'

contract('LockupTest', ([deployer, user1]) => {
	const init = async (): Promise<
		[DevProtocolInstance, PropertyInstance, PolicyTestForLockupInstance]
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
		return [dev, property, policy]
	}

	const err = (error: Error): Error => error

	// TODO:
	// describe('Lockup; cancel', () => {
	// 	it('An error occurs if you specify something other than a property address.', async () => {
	// 		const [dev, ,] = await init()
	// 		const res = await dev.lockup.cancel(user1).catch(err)
	// 		validateErrorMessage(res, 'this is illegal address')
	// 	})
	// 	it('An error occurs when specifying a property address that is not locked up.', async () => {
	// 		const [dev, property] = await init()
	// 		const res = await dev.lockup.cancel(property.address).catch(err)
	// 		validateErrorMessage(res, 'dev token is not locked')
	// 	})
	// 	it('An error will occur if not locked up.', async () => {
	// 		const [dev, property] = await init()
	// 		const res = await dev.lockup.cancel(property.address).catch(err)
	// 		validateErrorMessage(res, 'dev token is not locked')
	// 	})
	// 	it('Cannot be canceled during cancellation.', async () => {
	// 		const [dev, property] = await init()
	// 		await dev.dev.deposit(property.address, 10000)
	// 		await dev.lockup.cancel(property.address)
	// 		const res = await dev.lockup.cancel(property.address).catch(err)
	// 		validateErrorMessage(res, 'lockup is already canceled')
	// 	})
	// 	it('If you stand for a certain time after canceling, withdraw ends normally.', async () => {
	// 		const [dev, property] = await init()
	// 		await dev.dev.deposit(property.address, 10000)
	// 		await dev.lockup.cancel(property.address)
	// 		await mine(1)
	// 		await dev.lockup.withdraw(property.address)
	// 	})
	// 	it('Cannot be canceled after withdraw ends normally.', async () => {
	// 		const [dev, property] = await init()
	// 		await dev.dev.deposit(property.address, 10000)
	// 		await dev.lockup.cancel(property.address)
	// 		await mine(1)
	// 		await dev.lockup.withdraw(property.address)
	// 		const res = await dev.lockup.cancel(property.address).catch(err)
	// 		validateErrorMessage(res, 'dev token is not locked')
	// 	})
	// })
	// describe('Lockup; lockup', () => {
	// 	it('should fail to call when paused', async () => {
	// 		const [dev, ,] = await init()

	// 		await dev.lockup.pause()

	// 		const res = await dev.lockup.getAllValue().catch(err)
	// 		validatePauseErrorMessage(res, false)
	// 	})
	// 	it('should fail to call when sent from other than Dev Contract', async () => {
	// 		const [dev, property] = await init()

	// 		const res = await dev.lockup
	// 			.lockup(deployer, property.address, 10000)
	// 			.catch(err)
	// 		validateErrorMessage(res, 'this is illegal address')
	// 	})
	// 	it('should fail to call when passed address is not property contract', async () => {
	// 		const [dev] = await init()

	// 		const res = await dev.lockup.lockup(deployer, user1, 10000).catch(err)
	// 		validateErrorMessage(res, 'this is illegal address')
	// 	})
	// 	it('should fail to call when lockup is canceling', async () => {
	// 		const [dev, property] = await init()

	// 		await dev.addressConfig.setToken(deployer)
	// 		await dev.addressConfig.setLockup(deployer)
	// 		await dev.lockupStorage.setWithdrawalStatus(property.address, deployer, 1)
	// 		await dev.addressConfig.setLockup(dev.lockup.address)

	// 		const res = await dev.lockup
	// 			.lockup(deployer, property.address, 10000)
	// 			.catch(err)
	// 		validateErrorMessage(res, 'lockup is already canceled')
	// 	})
	// 	it('should fail to call when a passed value is 0', async () => {
	// 		const [dev, property] = await init()

	// 		await dev.addressConfig.setToken(deployer)
	// 		await dev.addressConfig.setLockup(deployer)
	// 		await dev.lockupStorage.setWithdrawalStatus(property.address, deployer, 1)
	// 		await dev.addressConfig.setLockup(dev.lockup.address)

	// 		const res = await dev.lockup
	// 			.lockup(deployer, property.address, 0)
	// 			.catch(err)
	// 		validateErrorMessage(res, 'illegal lockup value')
	// 	})
	// 	it(`should fail to call when token's transfer was failed`, async () => {
	// 		const [dev, property] = await init()

	// 		const res = await dev.dev
	// 			.deposit(property.address, 10000, {from: user1})
	// 			.catch(err)
	// 		validateErrorMessage(res, 'ERC20: transfer amount exceeds balance')
	// 	})
	// 	it('record transferred token as a lockup', async () => {
	// 		const [dev, property] = await init()

	// 		dev.dev.deposit(property.address, 10000).catch(err)
	// 		await waitForEvent(dev.lockup, WEB3_URI)('Lockedup')

	// 		const lockedupAmount = await dev.lockup
	// 			.getValue(property.address, deployer)
	// 			.then(toBigNumber)
	// 		expect(lockedupAmount.toFixed()).to.be.equal('10000')
	// 		const lockedupAllAmount = await dev.lockup.getAllValue().then(toBigNumber)
	// 		expect(lockedupAllAmount.toFixed()).to.be.equal('10000')
	// 	})
	// 	it('emit an event that notifies token locked-up', async () => {
	// 		const [dev, property] = await init()

	// 		await dev.dev.deposit(property.address, 10000).catch(err)
	// 		const [_from, _property, _value] = await Promise.all([
	// 			getEventValue(dev.lockup, WEB3_URI)('Lockedup', '_from'),
	// 			getEventValue(dev.lockup, WEB3_URI)('Lockedup', '_property'),
	// 			getEventValue(dev.lockup, WEB3_URI)('Lockedup', '_value'),
	// 		])

	// 		expect(_from).to.be.equal(deployer)
	// 		expect(_property).to.be.equal(property.address)
	// 		expect(_value).to.be.equal('10000')
	// 	})
	// })
	// describe('Lockup; withdraw', () => {
	// 	it('should fail to call when passed address is not property contract', async () => {
	// 		const [dev] = await init()

	// 		const res = await dev.lockup.withdraw(deployer).catch(err)
	// 		validateErrorMessage(res, 'this is illegal address')
	// 	})
	// 	it('should fail to call when waiting for released', async () => {
	// 		const [dev, property] = await init()

	// 		const res = await dev.lockup.withdraw(property.address).catch(err)
	// 		validateErrorMessage(res, 'waiting for release')
	// 	})
	// 	it('should fail to call when dev token is not locked', async () => {
	// 		const [dev, property] = await init()

	// 		await dev.addressConfig.setLockup(deployer)
	// 		await dev.lockupStorage.setWithdrawalStatus(property.address, deployer, 1)
	// 		await dev.addressConfig.setLockup(dev.lockup.address)

	// 		const res = await dev.lockup.withdraw(property.address).catch(err)
	// 		validateErrorMessage(res, 'dev token is not locked')
	// 	})
	// 	it(`withdrawing sender's withdrawable full amount`, async () => {
	// 		const [dev, property] = await init()
	// 		const beforeBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
	// 		const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

	// 		await dev.dev.deposit(property.address, 10000)
	// 		let lockedupAllAmount = await dev.lockup.getAllValue().then(toBigNumber)
	// 		expect(lockedupAllAmount.toFixed()).to.be.equal('10000')
	// 		await dev.addressConfig.setLockup(deployer)
	// 		await dev.lockupStorage.setWithdrawalStatus(property.address, deployer, 1)
	// 		await dev.addressConfig.setLockup(dev.lockup.address)

	// 		await dev.lockup.withdraw(property.address)
	// 		lockedupAllAmount = await dev.lockup.getAllValue().then(toBigNumber)
	// 		expect(lockedupAllAmount.toFixed()).to.be.equal('0')
	// 		const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
	// 		const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

	// 		expect(afterBalance.toFixed()).to.be.equal(beforeBalance.toFixed())
	// 		expect(afterTotalSupply.toFixed()).to.be.equal(
	// 			beforeTotalSupply.toFixed()
	// 		)
	// 	})
	// 	// Patch for DIP3
	// 	it('should fail to withdraw when not enable DIP3 and block is small', async () => {
	// 		const [dev, property, policy] = await init()
	// 		const beforeBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
	// 		const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

	// 		// Disable DIP3
	// 		await policy.setLockUpBlocks(10)

	// 		await dev.dev.deposit(property.address, 10000)
	// 		await dev.lockup.cancel(property.address)
	// 		const res = await dev.lockup.withdraw(property.address).catch(err)

	// 		const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
	// 		const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

	// 		expect(afterBalance.toFixed()).to.be.equal(
	// 			beforeBalance.minus(10000).toFixed()
	// 		)
	// 		expect(afterTotalSupply.toFixed()).to.be.equal(
	// 			beforeTotalSupply.toFixed()
	// 		)
	// 		validateErrorMessage(res, 'waiting for release')
	// 	})
	// 	it('can withdraw when enabling DIP3', async () => {
	// 		const [dev, property, policy] = await init()
	// 		const beforeBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
	// 		const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

	// 		// Disable DIP3
	// 		await policy.setLockUpBlocks(10)

	// 		await dev.dev.deposit(property.address, 10000)

	// 		// Enable DIP3
	// 		await policy.setLockUpBlocks(1)

	// 		await dev.lockup.cancel(property.address)
	// 		await dev.lockup.withdraw(property.address)

	// 		const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
	// 		const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

	// 		expect(afterBalance.toFixed()).to.be.equal(beforeBalance.toFixed())
	// 		expect(afterTotalSupply.toFixed()).to.be.equal(
	// 			beforeTotalSupply.toFixed()
	// 		)
	// 	})
	// })
	describe('Lockup; calculateWithdrawableInterestAmount', () => {
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
				await dev.dev.deposit(property.address, 10000, {from: alice})
				lastBlock = await dev.lockupStorage
					.getLastBlockNumber(property.address)
					.then(toBigNumber)
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
					lastBlock = await dev.lockupStorage
						.getLastBlockNumber(property.address)
						.then(toBigNumber)
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
			let lastBlock: BigNumber
			let bobBlock: BigNumber

			const alice = deployer
			const bob = user1

			before(async () => {
				;[dev, property] = await init()
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
				await dev.dev.deposit(property.address, 10000, {from: alice})
				lastBlock = await dev.lockupStorage
					.getLastBlockNumber(property.address)
					.then(toBigNumber)
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
					bobBlock = await getBlock().then(toBigNumber)
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
					const block = await getBlock().then(toBigNumber)
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					const expected = toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
						.times(1e18)
						.times(bobBlock.minus(lastBlock))
						.plus(
							toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
								.times(1e18)
								.times(block.minus(bobBlock))
								.times(0.8)
						)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Bob's withdrawable interest is 20% of interest since the first deposit`, async () => {
					await mine(3)
					const block = await getBlock().then(toBigNumber)
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)
					const expected = toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
						.times(1e18)
						.times(block.minus(bobBlock))
						.times(0.2)
					expect(bobAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after second withdrawal', () => {
				before(async () => {
					await dev.lockup.withdrawInterest(property.address, {from: alice})
					await dev.lockup.withdrawInterest(property.address, {from: bob})
					lastBlock = await getBlock().then(toBigNumber)
					await mine(3)
				})
				it(`Alice's withdrawable interest is 80% of current interest`, async () => {
					const block = await getBlock().then(toBigNumber)
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, alice)
						.then(toBigNumber)
					const expected = toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
						.times(1e18)
						.times(block.minus(lastBlock.minus(1)))
						.times(0.8)

					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
				it(`Bob's withdrawable interest is 20% of current interest`, async () => {
					const block = await getBlock().then(toBigNumber)
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmount(property.address, bob)
						.then(toBigNumber)
					const expected = toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
						.times(1e18)
						.times(block.minus(lastBlock))
						.times(0.2)

					expect(bobAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			// TODO:
			// describe('additional staking', () => {
			// 	it(`Bob does staking 30% of the Property's total lockups, Bob's share become ${
			// 		625000 / 16250
			// 	}%, Alice's share become ${1000000 / 16250}%`, async () => {
			// 		bobFirstDepositBlock = await getBlock()
			// 		await dev.dev.deposit(property.address, 12500 * 0.3, {from: bob})
			// 		const aliceBalance = await dev.lockup
			// 			.getValue(property.address, alice)
			// 			.then(toBigNumber)
			// 		const bobBalance = await dev.lockup
			// 			.getValue(property.address, bob)
			// 			.then(toBigNumber)

			// 		expect(10000).to.be.equal(
			// 			new BigNumber(16250)
			// 				.times(new BigNumber(10000).div(16250))
			// 				.toNumber()
			// 		)
			// 		expect(aliceBalance.toFixed()).to.be.equal('10000')
			// 		expect(6250).to.be.equal(
			// 			new BigNumber(16250)
			// 				.times(new BigNumber(6250).div(16250))
			// 				.toNumber()
			// 		)
			// 		expect(bobBalance.toFixed()).to.be.equal('6250')
			// 	})
			// })
			// TODO:
			// describe('after additional staking', () => {
			// 	it(`Alice's withdrawable interest is 80% of prev interest and ${
			// 		1000000 / 16250
			// 	}% of current interest`, async () => {
			// 		const lastBlock = await dev.lockupStorage
			// 			.getLastBlockNumber(property.address)
			// 			.then(toBigNumber)
			// 		const block = await getBlock()
			// 		const aliceAmount = await dev.lockup
			// 			.calculateWithdrawableInterestAmount(property.address, alice)
			// 			.then(toBigNumber)
			// 		const expected = toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
			// 			.times(1e18)
			// 			.times(lastBlock.minus(bobFirstDepositBlock))
			// 			.times(0.8)
			// 			.plus(
			// 				toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
			// 					.times(1e18)
			// 					.times(toBigNumber(block).minus(bobFirstDepositBlock))
			// 					.times(10000 / 16250)
			// 			)

			// 		expect(aliceAmount.toNumber()).to.be.equal(expected.toFixed())
			// 	})
			// 	it(`Bob's withdrawable interest is 20% of prev interest and ${
			// 		625000 / 16250
			// 	}% of current interest`, async () => {
			// 		const lastBlock = await dev.lockupStorage
			// 			.getLastBlockNumber(property.address)
			// 			.then(toBigNumber)
			// 		const block = await getBlock()
			// 		const bobAmount = await dev.lockup
			// 			.calculateWithdrawableInterestAmount(property.address, bob)
			// 			.then(toBigNumber)
			// 		const expected = toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
			// 			.times(1e18)
			// 			.times(lastBlock.minus(bobFirstDepositBlock))
			// 			.times(0.2)
			// 			.plus(
			// 				toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
			// 					.times(1e18)
			// 					.times(toBigNumber(block).minus(bobFirstDepositBlock))
			// 					.times(6250 / 16250)
			// 			)

			// 		expect(bobAmount.toNumber()).to.be.equal(expected.toFixed())
			// 	})
			// })
			// TODO:
			// describe('after withdrawal', () => {
			// 	before(async () => {
			// 		await dev.lockup.cancel(property.address, {from: alice})
			// 		await dev.lockup.cancel(property.address, {from: bob})
			// 		await dev.lockup.withdraw(property.address, {
			// 			from: alice,
			// 		})
			// 		await dev.lockup.withdraw(property.address, {
			// 			from: bob,
			// 		})
			// 	})
			// 	it(`Alice's withdrawable interest is 80% of prev interest and ${
			// 		1000000 / 16250
			// 	}% of current interest`, async () => {
			// 		const lastBlock = await dev.lockupStorage
			// 			.getLastBlockNumber(property.address)
			// 			.then(toBigNumber)
			// 		const block = await getBlock()
			// 		const aliceAmount = await dev.lockup
			// 			.calculateWithdrawableInterestAmount(property.address, alice)
			// 			.then(toBigNumber)
			// 		const expected = toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
			// 			.times(1e18)
			// 			.times(lastBlock.minus(bobFirstDepositBlock))
			// 			.times(0.8)
			// 			.plus(
			// 				toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
			// 					.times(1e18)
			// 					.times(toBigNumber(block).minus(bobFirstDepositBlock))
			// 					.times(10000 / 16250)
			// 			)

			// 		expect(aliceAmount.toNumber()).to.be.equal(expected.toFixed())
			// 	})
			// 	it(`Bob's withdrawable interest is 20% of prev interest and ${
			// 		625000 / 16250
			// 	}% of current interest`, async () => {
			// 		const lastBlock = await dev.lockupStorage
			// 			.getLastBlockNumber(property.address)
			// 			.then(toBigNumber)
			// 		const block = await getBlock()
			// 		const bobAmount = await dev.lockup
			// 			.calculateWithdrawableInterestAmount(property.address, bob)
			// 			.then(toBigNumber)
			// 		const expected = toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
			// 			.times(1e18)
			// 			.times(lastBlock.minus(bobFirstDepositBlock))
			// 			.times(0.2)
			// 			.plus(
			// 				toBigNumber(10) // In PolicyTestForLockup, the max staker reward per block is 10.
			// 					.times(1e18)
			// 					.times(toBigNumber(block).minus(bobFirstDepositBlock))
			// 					.times(6250 / 16250)
			// 			)

			// 		expect(bobAmount.toNumber()).to.be.equal(expected.toFixed())
			// 	})
			// })
		})
	})
	// TODO:
	// describe('Lockup; withdrawInterest', () => {
	// 	it('should fail to call when passed address is not property contract', async () => {
	// 		const [dev] = await init()

	// 		const res = await dev.lockup.withdrawInterest(deployer).catch(err)
	// 		validateErrorMessage(res, 'this is illegal address')
	// 	})
	// 	it(`should fail to call when hasn't withdrawable interest amount`, async () => {
	// 		const [dev, , property] = await init()

	// 		const res = await dev.lockup.withdrawInterest(property.address).catch(err)
	// 		validateErrorMessage(res, 'your interest amount is 0')
	// 	})
	// 	describe('withdrawing interest amount', () => {
	// 		let dev: DevProtocolInstance
	// 		let property: PropertyInstance

	// 		before(async () => {
	// 			;[dev, property] = await init()
	// 			await dev.lockup.lockup(deployer, property.address, 10000)
	// 		})

	// 		it(`withdrawing sender's withdrawable interest full amount`, async () => {
	// 			const beforeBalance = await dev.dev
	// 				.balanceOf(deployer)
	// 				.then(toBigNumber)
	// 			const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)
	// 			await mine(10)
	// 			const amount = await dev.lockup
	// 				.calculateWithdrawableInterestAmount(property.address, deployer)
	// 				.then(toBigNumber)

	// 			await dev.lockup.withdrawInterest(property.address)

	// 			const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
	// 			const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

	// 			expect(amount.toFixed()).to.be.equal('500000')
	// 			expect(afterBalance.toFixed()).to.be.equal(
	// 				beforeBalance.plus(amount).toFixed()
	// 			)
	// 			expect(afterTotalSupply.toFixed()).to.be.equal(
	// 				beforeTotalSupply.plus(amount).toFixed()
	// 			)
	// 		})
	// 		it('withdrawable interest amount becomes 0 when after withdrawing interest', async () => {
	// 			const amount = await dev.lockup
	// 				.calculateWithdrawableInterestAmount(property.address, deployer)
	// 				.then(toBigNumber)
	// 			expect(amount.toFixed()).to.be.equal('0')
	// 		})
	// 	})
	// })
})
