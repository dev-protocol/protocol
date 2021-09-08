/* eslint-disable @typescript-eslint/no-floating-promises */
import { DevProtocolInstance } from '../test-lib/instance'
import { PropertyInstance } from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import { mine, toBigNumber, getBlock } from '../test-lib/utils/common'
import { getPropertyAddress } from '../test-lib/utils/log'
import { getEventValue } from '../test-lib/utils/event'
import { validateErrorMessage } from '../test-lib/utils/error'

contract('LockupTest', ([deployer, user1, user2, user3]) => {
	const deployerBalance = new BigNumber(1e18).times(10000000)
	const init = async (): Promise<[DevProtocolInstance, PropertyInstance]> => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.generateDevMinter()
		await dev.generateSTokenManager()
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
			dev.generatePolicyFactory(),
			dev.generatePolicyGroup(),
		])
		await dev.dev.mint(deployer, deployerBalance)
		await dev.generatePolicy('PolicyTestBase')
		const propertyAddress = getPropertyAddress(
			await dev.propertyFactory.create('test', 'TEST', user2, {
				from: user2,
			})
		)
		const [property] = await Promise.all([
			artifacts.require('Property').at(propertyAddress),
		])

		await dev.addressConfig.setMetricsFactory(deployer)
		await dev.metricsGroup.addGroup(
			(
				await dev.createMetrics(deployer, property.address)
			).address
		)

		await dev.lockup.update()

		return [dev, property]
	}

	const init2 = async (): Promise<
		[DevProtocolInstance, PropertyInstance, number]
	> => {
		const [dev, property] = await init()
		await dev.dev.approve(dev.lockup.address, 500)
		await dev.lockup.depositToProperty(property.address, 100)
		const tokenId = await dev.sTokenManager.latestTokenId()

		return [dev, property, Number(tokenId)]
	}

	const err = (error: Error): Error => error

	describe('Lockup; sTokensManager', () => {
		it('get s tokens manager address', async () => {
			const [dev] = await init()

			const address = await dev.lockup.sTokensManager()
			expect(address).to.be.equal(dev.sTokenManager.address)
		})
	})
	describe('Lockup; depositToProperty', () => {
		describe('success', () => {
			it('get nft token.', async () => {
				const [dev, property] = await init()
				await dev.dev.approve(dev.lockup.address, 100)
				await dev.lockup.depositToProperty(property.address, 100)
				const owner = await dev.sTokenManager.ownerOf(1)
				expect(owner).to.be.equal(deployer)
				const position = await dev.sTokenManager.positions(1)
				expect(position[0]).to.be.equal(property.address)
				expect(position[1].toNumber()).to.be.equal(100)
				expect(position[2].toNumber()).to.be.equal(0)
				expect(position[3].toNumber()).to.be.equal(0)
				expect(position[4].toNumber()).to.be.equal(0)
			})
			it('get 2 nft token.', async () => {
				const getLastStakedInterestPrice = async (): Promise<string> => {
					const [dev, property] = await init()
					await mine(1)
					await dev.dev.deposit(property.address, 100)
					await mine(1)
					await dev.dev.deposit(property.address, 200)
					const value = await dev.lockup
						.getStorageLastStakedInterestPrice(property.address, deployer)
						.then(toBigNumber)
					return value.toFixed()
				}

				const [dev, property] = await init()
				await dev.dev.approve(dev.lockup.address, 100)
				await dev.lockup.depositToProperty(property.address, 100)
				await dev.dev.approve(dev.lockup.address, 200)
				await dev.lockup.depositToProperty(property.address, 200)
				const owner = await dev.sTokenManager.ownerOf(2)
				expect(owner).to.be.equal(deployer)
				const position = await dev.sTokenManager.positions(2)
				expect(position[0]).to.be.equal(property.address)
				expect(position[1].toNumber()).to.be.equal(200)
				const testValue = await getLastStakedInterestPrice()
				expect(position[2].toString()).to.be.equal(testValue)
				expect(position[3].toNumber()).to.be.equal(0)
				expect(position[4].toNumber()).to.be.equal(0)
			})
			it('generate event.', async () => {
				const [dev, property] = await init()
				await dev.dev.approve(dev.lockup.address, 100)
				dev.lockup.depositToProperty(property.address, 100)
				const [_from, _property, _value] = await Promise.all([
					getEventValue(dev.lockup)('Lockedup', '_from'),
					getEventValue(dev.lockup)('Lockedup', '_property'),
					getEventValue(dev.lockup)('Lockedup', '_value'),
				])
				expect(_from).to.be.equal(deployer)
				expect(_property).to.be.equal(property.address)
				expect(_value).to.be.equal('100')
			})
			it('set storage value.', async () => {
				const [dev, property] = await init()
				await dev.dev.approve(dev.lockup.address, 100)
				await dev.lockup.depositToProperty(property.address, 100)
				const allValue = await dev.lockup.getStorageAllValue()
				expect(allValue.toString()).to.be.equal('100')
				const propertyValue = await dev.lockup.getStoragePropertyValue(
					property.address
				)
				expect(propertyValue.toString()).to.be.equal('100')
			})
			it('staking dev token.', async () => {
				const [dev, property] = await init()
				await dev.dev.approve(dev.lockup.address, 100)
				const beforeBalance = await dev.dev
					.balanceOf(deployer)
					.then(toBigNumber)
				const beforePropertyBalance = await dev.dev.balanceOf(property.address)
				expect(beforeBalance.toString()).to.be.equal(deployerBalance.toString())
				expect(beforePropertyBalance.toString()).to.be.equal('0')
				await dev.lockup.depositToProperty(property.address, 100)
				const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const afterPropertyBalance = await dev.dev.balanceOf(property.address)
				expect(afterBalance.toString()).to.be.equal(
					deployerBalance.minus(100).toString()
				)
				expect(afterPropertyBalance.toString()).to.be.equal('100')
			})
		})
		describe('fail', () => {
			it('Attempt to deposit money into an unauthenticated property.', async () => {
				const [dev] = await init()
				const propertyAddress = getPropertyAddress(
					await dev.propertyFactory.create('test2', 'TEST2', user2, {
						from: user2,
					})
				)
				const res = await dev.lockup
					.depositToProperty(propertyAddress, 100)
					.catch(err)
				validateErrorMessage(res, 'unable to stake to unauthenticated property')
			})
			it('0 dev staking is not possible.', async () => {
				const [dev, property] = await init()
				const res = await dev.lockup
					.depositToProperty(property.address, 0)
					.catch(err)
				validateErrorMessage(res, 'illegal deposit amount')
			})
			it('user is not holding dev.', async () => {
				const [dev, property] = await init()
				const res = await dev.lockup
					.depositToProperty(property.address, 100, { from: user3 })
					.catch(err)
				validateErrorMessage(res, 'ERC20: transfer amount exceeds balance')
			})
		})
	})
	describe('Lockup; deposit(update)', () => {
		describe('success', () => {
			it('update nft.', async () => {
				const getTestValues = async (): Promise<[string, string]> => {
					const [dev, property] = await init()
					await mine(1)
					await dev.dev.deposit(property.address, 100)
					await dev.dev.deposit(property.address, 100)
					const value1 = await dev.lockup
						.getStorageLastStakedInterestPrice(property.address, deployer)
						.then(toBigNumber)
					const value2 = await dev.lockup
						.getStoragePendingInterestWithdrawal(property.address, deployer)
						.then(toBigNumber)
					return [value1.toFixed(), value2.toFixed()]
				}

				const [dev, property, tokenId] = await init2()
				const beforePosition = await dev.sTokenManager.positions(tokenId)
				expect(beforePosition[0]).to.be.equal(property.address)
				expect(beforePosition[1].toNumber()).to.be.equal(100)
				expect(beforePosition[2].toNumber()).to.be.equal(0)
				expect(beforePosition[3].toNumber()).to.be.equal(0)
				expect(beforePosition[4].toNumber()).to.be.equal(0)
				await dev.lockup.depositToPosition(tokenId, 100)
				const afterPosition = await dev.sTokenManager.positions(tokenId)
				expect(afterPosition[0]).to.be.equal(property.address)
				expect(afterPosition[1].toNumber()).to.be.equal(200)
				const [lastStakedInterestPrice, pendingInterestWithdrawal] =
					await getTestValues()
				expect(afterPosition[2].toString()).to.be.equal(lastStakedInterestPrice)
				expect(afterPosition[3].toString()).to.be.equal(
					pendingInterestWithdrawal
				)
				expect(afterPosition[4].toString()).to.be.equal(
					pendingInterestWithdrawal
				)
			})
			it('generate event.', async () => {
				const [dev, property, tokenId] = await init2()
				dev.lockup.depositToPosition(tokenId, 300)
				const [_from, _property, _value] = await Promise.all([
					getEventValue(dev.lockup)('Lockedup', '_from'),
					getEventValue(dev.lockup)('Lockedup', '_property'),
					getEventValue(dev.lockup)('Lockedup', '_value'),
				])
				expect(_from).to.be.equal(deployer)
				expect(_property).to.be.equal(property.address)
				expect(_value).to.be.equal('300')
			})
			it('set storage value.', async () => {
				const [dev, property, tokenId] = await init2()
				await dev.lockup.depositToPosition(tokenId, 300)
				const allValue = await dev.lockup.getStorageAllValue()
				expect(allValue.toString()).to.be.equal('400')
				const propertyValue = await dev.lockup.getStoragePropertyValue(
					property.address
				)
				expect(propertyValue.toString()).to.be.equal('400')
			})
			it('staking dev token.', async () => {
				const [dev, property, tokenId] = await init2()
				const beforeBalance = await dev.dev
					.balanceOf(deployer)
					.then(toBigNumber)
				const beforePropertyBalance = await dev.dev.balanceOf(property.address)
				expect(beforeBalance.toString()).to.be.equal(
					deployerBalance.minus(100).toString()
				)
				expect(beforePropertyBalance.toString()).to.be.equal('100')
				await dev.lockup.depositToPosition(tokenId, 300)
				const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const afterPropertyBalance = await dev.dev.balanceOf(property.address)
				expect(afterBalance.toString()).to.be.equal(
					deployerBalance.minus(100).minus(300).toString()
				)
				expect(afterPropertyBalance.toString()).to.be.equal('400')
			})
		})
		describe('fail', () => {
			it('Cannot update position if sender and owner are different.', async () => {
				const [dev, , tokenId] = await init2()
				const res = await dev.lockup
					.depositToPosition(tokenId, 100, { from: user3 })
					.catch(err)
				validateErrorMessage(res, 'illegal sender')
			})
			it('0 dev staking is not possible.', async () => {
				const [dev, , tokenId] = await init2()
				const res = await dev.lockup.depositToPosition(tokenId, 0).catch(err)
				validateErrorMessage(res, 'illegal deposit amount')
			})
			it('user is not holding dev.', async () => {
				const [dev, , tokenId] = await init2()
				const res = await dev.lockup.depositToPosition(tokenId, 1000).catch(err)
				validateErrorMessage(res, 'ERC20: transfer amount exceeds allowance')
			})
		})
	})
	describe('Lockup; withdrawByPosition', () => {
		describe('success', () => {
			it('update nft position.', async () => {
				const getTestValues = async (): Promise<[string, string]> => {
					const [dev, property] = await init()
					await mine(1)
					await dev.dev.deposit(property.address, 100)
					await dev.dev.deposit(property.address, 100)
					const value1 = await dev.lockup
						.getStorageLastStakedInterestPrice(property.address, deployer)
						.then(toBigNumber)
					const value2 = await dev.lockup
						.getStoragePendingInterestWithdrawal(property.address, deployer)
						.then(toBigNumber)
					return [value1.toFixed(), value2.toFixed()]
				}

				const [dev, property, tokenId] = await init2()
				const beforePosition = await dev.sTokenManager.positions(tokenId)
				expect(beforePosition[0]).to.be.equal(property.address)
				expect(beforePosition[1].toNumber()).to.be.equal(100)
				expect(beforePosition[2].toNumber()).to.be.equal(0)
				expect(beforePosition[3].toNumber()).to.be.equal(0)
				expect(beforePosition[4].toNumber()).to.be.equal(0)
				await dev.lockup.withdrawByPosition(tokenId, 100)
				const afterPosition = await dev.sTokenManager.positions(tokenId)
				expect(afterPosition[0]).to.be.equal(property.address)
				expect(afterPosition[1].toNumber()).to.be.equal(0)
				const [lastStakedInterestPrice, pendingInterestWithdrawal] =
					await getTestValues()
				expect(afterPosition[2].toString()).to.be.equal(lastStakedInterestPrice)
				expect(afterPosition[3].toString()).to.be.equal(
					pendingInterestWithdrawal
				)
				expect(beforePosition[4].toNumber()).to.be.equal(0)
			})
			it('get reward.', async () => {
				const [dev, , tokenId] = await init2()
				const beforeBalance = await dev.dev
					.balanceOf(deployer)
					.then(toBigNumber)
				await dev.lockup.withdrawByPosition(tokenId, 0)
				const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const reward = afterBalance.minus(beforeBalance)
				expect(reward.toString()).to.be.equal('10000000000000000000')
			})
			it('reverce staking dev token.', async () => {
				const [dev, , tokenId] = await init2()
				const beforeBalance = await dev.dev
					.balanceOf(deployer)
					.then(toBigNumber)
				await dev.lockup.withdrawByPosition(tokenId, 100)
				const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const rewardPlusStakedDev = afterBalance.minus(beforeBalance)
				const stakedDev = rewardPlusStakedDev.minus('10000000000000000000')
				expect(stakedDev.toString()).to.be.equal('100')
			})
			it('set storage value.', async () => {
				const [dev, property, tokenId] = await init2()
				await dev.lockup.withdrawByPosition(tokenId, 100)
				const allValue = await dev.lockup.getStorageAllValue()
				expect(allValue.toString()).to.be.equal('0')
				const propertyValue = await dev.lockup.getStoragePropertyValue(
					property.address
				)
				expect(propertyValue.toString()).to.be.equal('0')
			})
		})
		describe('fail', () => {
			it('Cannot withdraw reward if sender and owner are different.', async () => {
				const [dev, , tokenId] = await init2()
				const res = await dev.lockup
					.withdrawByPosition(tokenId, 100, { from: user3 })
					.catch(err)
				validateErrorMessage(res, 'illegal sender')
			})
			it('Withdrawal amount is greater than deposit amount.', async () => {
				const [dev, , tokenId] = await init2()
				const res = await dev.lockup.withdrawByPosition(tokenId, 200).catch(err)
				validateErrorMessage(res, 'insufficient tokens staked')
			})
		})
	})

	describe('Lockup; migrateToSTokens', () => {
		describe('success', () => {
			it('generate nft token.', async () => {
				const [dev, property] = await init()
				await dev.dev.deposit(property.address, 100)
				const beforeBalance = await dev.sTokenManager.balanceOf(deployer)
				expect(beforeBalance.toNumber()).to.be.equal(0)
				await dev.lockup.migrateToSTokens(property.address)
				const afterBalance = await dev.sTokenManager.balanceOf(deployer)
				expect(afterBalance.toNumber()).to.be.equal(1)
			})
			it('creator rewards will be carried over..', async () => {
				const [dev, property] = await init()
				await dev.dev.deposit(property.address, 100)
				await mine(1)
				const reward = await dev.lockup.calculateWithdrawableInterestAmount(property.address, deployer).then(toBigNumber)
				expect(reward.toString()).to.be.equal('10000000000000000000')
				await dev.lockup.migrateToSTokens(property.address)
				const reward2 = await dev.lockup.calculateWithdrawableInterestAmountByPosition(1).then(toBigNumber)
				expect(reward2.toString()).to.be.equal('20000000000000000000')
				const reward3 = await dev.lockup.calculateWithdrawableInterestAmount(property.address, deployer).then(toBigNumber)
				expect(reward3.toString()).to.be.equal('0')
				const afterBalance = await dev.sTokenManager.balanceOf(deployer)
				expect(afterBalance.toNumber()).to.be.equal(1)
			})
			it('update storage data.', async () => {
				const [dev, property] = await init()
				await dev.dev.deposit(property.address, 100)
				await dev.lockup.migrateToSTokens(property.address)
				const pendingInterestWithdrawal =
					await dev.lockup.getStoragePendingInterestWithdrawal(
						property.address,
						deployer
					)
				const value = await dev.lockup.getStorageValue(
					property.address,
					deployer
				)
				expect(pendingInterestWithdrawal.toNumber()).to.be.equal(0)
				expect(value.toNumber()).to.be.equal(0)
			})
			it('update position information.', async () => {
				const [dev, property] = await init()
				await dev.dev.deposit(property.address, 100)
				await dev.lockup.migrateToSTokens(property.address)
				const position = await dev.sTokenManager.positions(1)
				expect(position[0]).to.be.equal(property.address)
				expect(position[1].toNumber()).to.be.equal(100)
				expect(position[2].toNumber()).to.be.equal(0)
				expect(position[3].toNumber()).to.be.equal(0)
				expect(position[4].toNumber()).to.be.equal(0)
			})
		})
		describe('fail', () => {
			it('Not staking.', async () => {
				const [dev, property] = await init()
				const res = await dev.lockup
					.migrateToSTokens(property.address)
					.catch(err)
				validateErrorMessage(res, 'not staked')
			})
			it('Different users.', async () => {
				const [dev, property] = await init()
				await dev.dev.deposit(property.address, 100)
				const res = await dev.lockup
					.migrateToSTokens(property.address, { from: user3 })
					.catch(err)
				validateErrorMessage(res, 'not staked')
			})
		})
	})
	describe('Lockup; calculateWithdrawableInterestAmountByPosition', () => {
		type Calculator = (tokenId: number) => Promise<string>
		const createCalculator =
			(dev: DevProtocolInstance): Calculator =>
			async (tokenId: number): Promise<string> => {
				const position = await dev.sTokenManager.positions(tokenId)
				const amount = toBigNumber(position[1])
				const price = toBigNumber(position[2])
				const pendingReward = toBigNumber(position[4])
				const prices = await dev.lockup.calculateCumulativeRewardPrices()
				const interest = toBigNumber(prices[2])
				const interestAmount = interest.gte(price)
					? interest.minus(price).times(amount).div(1e18)
					: 0

				return pendingReward
					.plus(interestAmount)
					.toFixed(0, BigNumber.ROUND_DOWN)
			}

		describe('returns correct amount', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let calc: Calculator

			const alice = deployer
			const bob = user1
			const aliceFirstTokenId = 1
			const bobFirstTokenId = 2
			const aliceSecoundTokenId = 3
			const bobSecoundTokenId = 4
			const aliceThirdTokenId = 6
			const aliceFourthTokenId = 7

			before(async () => {
				;[dev, property] = await init()
				calc = createCalculator(dev)
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
				await dev.dev.approve(dev.lockup.address, aliceBalance.times(2), {
					from: alice,
				})
				await dev.dev.approve(dev.lockup.address, aliceBalance.times(2), {
					from: bob,
				})
			})

			/*
			 * PolicyTestBase returns 100 as rewards
			 * And stakers share is 10%
			 */
			it('Alice has a 100% of interests', async () => {
				await dev.lockup.depositToProperty(property.address, 1000000000000, {
					from: alice,
				})
				await mine(1)

				const result = await dev.lockup
					.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
					.then(toBigNumber)
				const expected = toBigNumber(10).times(1e18)
				const calculated = await calc(aliceFirstTokenId)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated)
			})
			it('Alice has a 100% of interests after withdrawal', async () => {
				await dev.lockup.withdrawByPosition(aliceFirstTokenId, 0, {
					from: alice,
				})
				await mine(1)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
					.then(toBigNumber)
				const expected = toBigNumber(10).times(1e18)
				const calculated = await calc(aliceFirstTokenId)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated)
			})
			it('Alice has a 50% of interests', async () => {
				await dev.lockup.depositToProperty(property.address, 1000000000000, {
					from: bob,
				})
				await dev.lockup.withdrawByPosition(aliceFirstTokenId, 0, {
					from: alice,
				})
				await mine(1)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
					.then(toBigNumber)
				const expected = toBigNumber(10)
					.times(1e18)
					.times(1000000000000 / (1000000000000 * 2))
				const calculated = await calc(aliceFirstTokenId)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated)
			})
			it('Alice has a 75% of interests', async () => {
				await dev.lockup.depositToPosition(aliceFirstTokenId, 1000000000000, {
					from: alice,
				})
				await dev.lockup.depositToPosition(aliceFirstTokenId, 1000000000000, {
					from: alice,
				})
				await dev.lockup.withdrawByPosition(aliceFirstTokenId, 0, {
					from: alice,
				})
				await mine(1)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
					.then(toBigNumber)
				const expected = toBigNumber(10)
					.times(1e18)
					.times(3000000000000 / (1000000000000 * 4))
				const calculated = await calc(aliceFirstTokenId)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated)
			})
			it('Bob has a 30% of interests before withdrawal', async () => {
				const result = await dev.lockup
					.calculateWithdrawableInterestAmountByPosition(bobFirstTokenId)
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
				const calculated = await calc(bobFirstTokenId)
				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated)
			})
			it('Bob has a 25% of interests', async () => {
				await dev.lockup.withdrawByPosition(bobFirstTokenId, 0, { from: bob })
				await mine(1)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmountByPosition(bobFirstTokenId)
					.then(toBigNumber)
				const expected = toBigNumber(10)
					.times(1e18)
					.times(1000000000000 / (1000000000000 * 4))
				const calculated = await calc(bobFirstTokenId)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated)
			})
			it('Alice can withdraw 5 blocks', async () => {
				await dev.lockup.withdrawByPosition(aliceFirstTokenId, 0, {
					from: alice,
				})
				await mine(5)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
					.then(toBigNumber)
				const expected = toBigNumber(10)
					.times(1e18)
					.times(3000000000000 / (1000000000000 * 4))
					.times(5)
				const calculated = await calc(aliceFirstTokenId)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated)
			})
			it('Alice has a 100% of interests', async () => {
				const alicePosition = await dev.sTokenManager.positions(
					aliceFirstTokenId
				)
				await dev.lockup.withdrawByPosition(
					aliceFirstTokenId,
					alicePosition[1].toString(),
					{ from: alice }
				)
				const bobPosition = await dev.sTokenManager.positions(bobFirstTokenId)
				await dev.lockup.withdrawByPosition(
					bobFirstTokenId,
					bobPosition[1].toString(),
					{ from: bob }
				)
				await dev.lockup.depositToProperty(property.address, 1000000000000, {
					from: alice,
				})
				await mine(1)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmountByPosition(aliceSecoundTokenId)
					.then(toBigNumber)
				const expected = toBigNumber(10).times(1e18)
				const calculated = await calc(aliceSecoundTokenId)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated)
			})
			it('After withdrawn, Alice and Bob has a 0% of interests', async () => {
				await dev.lockup.depositToPosition(aliceSecoundTokenId, 1000000000000, {
					from: alice,
				})
				await dev.lockup.depositToProperty(property.address, 1000000000000, {
					from: bob,
				})
				await mine(2)
				const alicePosition = await dev.sTokenManager.positions(
					aliceSecoundTokenId
				)
				await dev.lockup.withdrawByPosition(
					aliceSecoundTokenId,
					alicePosition[1].toString(),
					{ from: alice }
				)
				const bobPosition = await dev.sTokenManager.positions(bobSecoundTokenId)
				await dev.lockup.withdrawByPosition(
					bobSecoundTokenId,
					bobPosition[1].toString(),
					{ from: bob }
				)
				await mine(1)
				const aliceAmount =
					await dev.lockup.calculateWithdrawableInterestAmountByPosition(
						aliceSecoundTokenId
					)
				const bobAmount =
					await dev.lockup.calculateWithdrawableInterestAmountByPosition(
						bobSecoundTokenId
					)
				const aliceCalculated = await calc(aliceSecoundTokenId)
				const bobCalculated = await calc(bobSecoundTokenId)

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
				await dev.lockup.depositToProperty(property.address, bobBalance, {
					from: bob,
				})
				await mine(10)

				await dev.lockup.depositToProperty(property2.address, 10000000, {
					from: alice,
				})
				await mine(1)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmountByPosition(aliceThirdTokenId)
					.then(toBigNumber)
				const expected = toBigNumber(10)
					.times(1e18)
					.times(
						toBigNumber(10000000).div(toBigNumber(10000000).plus(bobBalance))
					)
				const calculated = await calc(aliceThirdTokenId)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
				expect(result.toFixed()).to.be.equal(calculated)
			})
			it('Property that unauthenticated but already staked before DIP9 has no reward', async () => {
				const propertyAddress = getPropertyAddress(
					await dev.propertyFactory.create('test', 'TEST', deployer)
				)
				await dev.metricsGroup.__setMetricsCountPerProperty(propertyAddress, 1)
				await dev.lockup.depositToProperty(propertyAddress, 1000000000000, {
					from: alice,
				})
				await mine(1)
				await dev.lockup.depositToPosition(aliceFourthTokenId, 1000000000000, {
					from: alice,
				})
				await mine(1)
				await dev.metricsGroup.__setMetricsCountPerProperty(propertyAddress, 0)
				const result = await dev.lockup
					.calculateWithdrawableInterestAmountByPosition(aliceFourthTokenId)
					.then(toBigNumber)
				const expected = toBigNumber(0)

				expect(result.toFixed()).to.be.equal(expected.toFixed())
			})
		})

		describe('scenario; token transfer', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let lastBlock: BigNumber

			const alice = deployer
			const bob = user1

			const aliceFirstTokenId = 1

			before(async () => {
				;[dev, property] = await init()
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
				await dev.dev.approve(dev.lockup.address, aliceBalance, { from: alice })
				await dev.lockup.depositToProperty(property.address, 10000, {
					from: alice,
				})

				lastBlock = await getBlock().then(toBigNumber)
			})

			/*
			 * PolicyTestBase returns 100 as rewards
			 * And stakers share is 10%
			 */

			describe('before run', () => {
				it(`Alice does staking 100% of the Property's total lockups`, async () => {
					const total = await dev.lockup
						.getPropertyValue(property.address)
						.then(toBigNumber)
					const position = await dev.sTokenManager.positions(aliceFirstTokenId)
					expect(toBigNumber(position[1]).toFixed()).to.be.equal(
						total.toFixed()
					)
				})
				it(`Alice's withdrawable interest is 100% of the Property's interest`, async () => {
					await mine(9)
					const block = await getBlock().then(toBigNumber)
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
						.then(toBigNumber)
					const expected = toBigNumber(10) // In PolicyTestBase, the max staker reward per block is 10.
						.times(1e18)
						.times(block.minus(lastBlock))
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('token transfer', () => {
				before(async () => {
					await dev.sTokenManager.safeTransferFrom(
						alice,
						bob,
						aliceFirstTokenId
					)
				})
				it(`withdrawable interest is 100% of the Property's interest`, async () => {
					await mine(3)
					const calculateAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
						.then(toBigNumber)
					const expected = toBigNumber(10) // In PolicyTestBase, the max staker reward per block is 10.
						.times(1e18)
						.times(13)
					expect(calculateAmount.toFixed()).to.be.equal(expected.toFixed())
					const ownerAddress = await dev.sTokenManager.ownerOf(
						aliceFirstTokenId
					)
					expect(ownerAddress).to.be.equal(bob)
				})
			})
			describe('Alice can not withdraw reward', () => {
				it(`if Alice execute withdraw function, error is occur`, async () => {
					const res = await dev.lockup
						.withdrawByPosition(aliceFirstTokenId, 0, {
							from: alice,
						})
						.catch(err)
					validateErrorMessage(res, 'illegal sender')
				})
			})

			describe('after withdrawal', () => {
				let bobBalance: BigNumber
				let bobLocked: BigNumber
				before(async () => {
					bobBalance = await dev.dev.balanceOf(bob).then(toBigNumber)
					const position = await dev.sTokenManager.positions(aliceFirstTokenId)
					bobLocked = toBigNumber(position[1])
					await dev.lockup.withdrawByPosition(aliceFirstTokenId, bobLocked, {
						from: bob,
					})
				})
				it(`Alice's withdrawable interest is 100% of the Property's interest`, async () => {
					const block = await getBlock().then(toBigNumber)
					const position = await dev.sTokenManager.positions(aliceFirstTokenId)
					const bobLockup = toBigNumber(position[1])
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
						.then(toBigNumber)
					const afterBobBalance = await dev.dev.balanceOf(bob).then(toBigNumber)
					const reward = toBigNumber(10) // In PolicyTestBase, the max staker reward per block is 10.
						.times(1e18)
						.times(block.minus(lastBlock))
					expect(bobAmount.toFixed()).to.be.equal('0')
					expect(bobLockup.toFixed()).to.be.equal('0')
					console.log(1)
					expect(afterBobBalance.toFixed()).to.be.equal(
						bobBalance.plus(bobLocked).plus(reward).toFixed()
					)
					console.log(2)
				})
			})
		})

		describe('scenario; single lockup', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let lastBlock: BigNumber

			const alice = deployer
			const bob = user1

			const aliceFirstTokenId = 1

			before(async () => {
				;[dev, property] = await init()
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
				await dev.dev.approve(dev.lockup.address, aliceBalance, { from: alice })
				await dev.lockup.depositToProperty(property.address, 10000, {
					from: alice,
				})

				lastBlock = await getBlock().then(toBigNumber)
			})

			/*
			 * PolicyTestBase returns 100 as rewards
			 * And stakers share is 10%
			 */

			describe('before second run', () => {
				it(`Alice does staking 100% of the Property's total lockups`, async () => {
					const total = await dev.lockup
						.getPropertyValue(property.address)
						.then(toBigNumber)
					const position = await dev.sTokenManager.positions(aliceFirstTokenId)
					expect(toBigNumber(position[1]).toFixed()).to.be.equal(
						total.toFixed()
					)
				})
				it(`Alice's withdrawable interest is 100% of the Property's interest`, async () => {
					await mine(9)
					const block = await getBlock().then(toBigNumber)
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
						.then(toBigNumber)
					const expected = toBigNumber(10) // In PolicyTestBase, the max staker reward per block is 10.
						.times(1e18)
						.times(block.minus(lastBlock))
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after second run', () => {
				before(async () => {
					await dev.lockup.withdrawByPosition(aliceFirstTokenId, 0, {
						from: alice,
					})
					lastBlock = await getBlock().then(toBigNumber)
				})
				it(`Alice's withdrawable interest is 100% of the Property's interest`, async () => {
					await mine(3)
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
						.then(toBigNumber)
					const expected = toBigNumber(10) // In PolicyTestBase, the max staker reward per block is 10.
						.times(1e18)
						.times(3)
					expect(aliceAmount.toFixed()).to.be.equal(expected.toFixed())
				})
			})
			describe('after additional staking', () => {
				before(async () => {
					await dev.lockup.depositToPosition(aliceFirstTokenId, 10000, {
						from: alice,
					})
				})
				it(`Alice's withdrawable interest is 100% of the Property's interest`, async () => {
					const block = await getBlock().then(toBigNumber)
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
						.then(toBigNumber)
					const expected = toBigNumber(10) // In PolicyTestBase, the max staker reward per block is 10.
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
					const position = await dev.sTokenManager.positions(aliceFirstTokenId)
					aliceLocked = toBigNumber(position[1])
					await dev.lockup.withdrawByPosition(aliceFirstTokenId, aliceLocked, {
						from: alice,
					})
				})
				it(`Alice's withdrawable interest is 100% of the Property's interest`, async () => {
					const block = await getBlock().then(toBigNumber)
					const position = await dev.sTokenManager.positions(aliceFirstTokenId)
					const aliceLockup = toBigNumber(position[1])
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
						.then(toBigNumber)
					const afterAliceBalance = await dev.dev
						.balanceOf(alice)
						.then(toBigNumber)
					const reward = toBigNumber(10) // In PolicyTestBase, the max staker reward per block is 10.
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

			const aliceFirstTokenId = 1
			const bobFirstTokenId = 2

			before(async () => {
				;[dev, property] = await init()
				calc = createCalculator(dev)
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
				await dev.dev.approve(dev.lockup.address, aliceBalance, { from: alice })
				await dev.dev.approve(dev.lockup.address, aliceBalance, { from: bob })
				await dev.lockup.depositToProperty(property.address, 10000, {
					from: alice,
				})
			})

			describe('before second run', () => {
				it(`Alice does staking 100% of the Property's total lockups`, async () => {
					const total = await dev.lockup
						.getPropertyValue(property.address)
						.then(toBigNumber)
					const position = await dev.sTokenManager.positions(aliceFirstTokenId)
					const aliceBalance = toBigNumber(position[1])
					expect(aliceBalance.toFixed()).to.be.equal(total.toFixed())
				})
				it(`Bob does staking 25% of the Property's total lockups, Alice's share become 80%`, async () => {
					await dev.lockup.depositToProperty(property.address, 10000 * 0.25, {
						from: bob,
					})
					const total = await dev.lockup
						.getPropertyValue(property.address)
						.then(toBigNumber)
					const alicePosition = await dev.sTokenManager.positions(
						aliceFirstTokenId
					)
					const aliceBalance = toBigNumber(alicePosition[1])
					const bobPosition = await dev.sTokenManager.positions(bobFirstTokenId)
					const bobBalance = toBigNumber(bobPosition[1])

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
						.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
						.then(toBigNumber)
					const expected = await calc(aliceFirstTokenId)
					expect(aliceAmount.toFixed()).to.be.equal(expected)
				})
				it(`Bob's withdrawable interest is 20% of interest since the first deposit`, async () => {
					await mine(3)
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(bobFirstTokenId)
						.then(toBigNumber)
					const expected = await calc(bobFirstTokenId)
					expect(bobAmount.toFixed()).to.be.equal(expected)
				})
			})
			describe('after second withdrawal', () => {
				before(async () => {
					await dev.lockup.withdrawByPosition(aliceFirstTokenId, 0, {
						from: alice,
					})
					await dev.lockup.withdrawByPosition(bobFirstTokenId, 0, { from: bob })
					await mine(3)
				})
				it(`Alice's withdrawable interest is 80% of current interest`, async () => {
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
						.then(toBigNumber)
					const expected = await calc(aliceFirstTokenId)

					expect(aliceAmount.toFixed()).to.be.equal(expected)
				})
				it(`Bob's withdrawable interest is 20% of current interest`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(bobFirstTokenId)
						.then(toBigNumber)
					const expected = await calc(bobFirstTokenId)

					expect(bobAmount.toFixed()).to.be.equal(expected)
				})
			})
			describe('additional staking', () => {
				before(async () => {
					await dev.lockup.depositToPosition(bobFirstTokenId, 12500 * 0.3, {
						from: bob,
					})
					await mine(3)
				})
				it(`Bob does staking 30% of the Property's total lockups, Bob's share become ${
					625000 / 16250
				}%, Alice's share become ${1000000 / 16250}%`, async () => {
					const alicePosition = await dev.sTokenManager.positions(
						aliceFirstTokenId
					)
					const aliceBalance = toBigNumber(alicePosition[1])
					const bobPosition = await dev.sTokenManager.positions(bobFirstTokenId)
					const bobBalance = toBigNumber(bobPosition[1])

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
						.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
						.then(toBigNumber)
					const expected = await calc(aliceFirstTokenId)

					expect(aliceAmount.toFixed()).to.be.equal(expected)
				})
				it(`Bob's withdrawable interest is 20% of prev interest and ${
					625000 / 16250
				}% of current interest`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(bobFirstTokenId)
						.then(toBigNumber)
					const expected = await calc(bobFirstTokenId)

					expect(bobAmount.toFixed()).to.be.equal(expected)
				})
			})
			describe('after withdrawal', () => {
				before(async () => {
					const alicePosition = await dev.sTokenManager.positions(
						aliceFirstTokenId
					)
					const aliceBalance = toBigNumber(alicePosition[1])
					await dev.lockup.withdrawByPosition(aliceFirstTokenId, aliceBalance, {
						from: alice,
					})
					await mine(3)
					const bobPosition = await dev.sTokenManager.positions(bobFirstTokenId)
					const bobBalance = toBigNumber(bobPosition[1])
					await dev.lockup.withdrawByPosition(bobFirstTokenId, bobBalance, {
						from: bob,
					})
					await mine(3)
				})
				it(`Alice's withdrawable interest is 0`, async () => {
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
						.then(toBigNumber)

					expect(aliceAmount.toFixed()).to.be.equal('0')
				})
				it(`Bob's withdrawable interest is 0`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(bobFirstTokenId)
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

			const alice = user2
			const bob = user1

			const aliceFirstTokenId = 1
			const bobFirstTokenId = 2
			const aliceSecoundTokenId = 3

			before(async () => {
				;[dev, property1] = await init()
				await dev.dev.mint(alice, new BigNumber(1e18).times(10000000))
				calc = createCalculator(dev)
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
				await dev.dev.approve(dev.lockup.address, aliceBalance, { from: alice })
				await dev.dev.approve(dev.lockup.address, aliceBalance, { from: bob })
				;[property2, property3, property4] = await Promise.all([
					artifacts
						.require('Property')
						.at(
							getPropertyAddress(
								await dev.propertyFactory.create('test2', 'TEST2', user3)
							)
						),
					artifacts
						.require('Property')
						.at(
							getPropertyAddress(
								await dev.propertyFactory.create('test3', 'TEST3', user3)
							)
						),
					artifacts
						.require('Property')
						.at(
							getPropertyAddress(
								await dev.propertyFactory.create('test4', 'TEST4', user3)
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

				await dev.lockup.depositToProperty(property1.address, 10000, {
					from: alice,
				})
				await mine(3)
			})

			describe('before withdrawal', () => {
				it(`Alice does staking 100% of the Property1 total lockups, Property1 is 100% of the total rewards`, async () => {
					const total = await dev.lockup
						.getPropertyValue(property1.address)
						.then(toBigNumber)
					const position = await dev.sTokenManager.positions(aliceFirstTokenId)
					const aliceBalance = toBigNumber(position[1])
					expect(aliceBalance.toFixed()).to.be.equal(total.toFixed())
				})
				it(`Bob does staking 100% of the Property2 total lockups, Property2 is 20% of the total rewards`, async () => {
					await dev.lockup.depositToProperty(property2.address, 2500, {
						from: bob,
					})
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
						.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
						.then(toBigNumber)
					const expected = await calc(aliceFirstTokenId)
					expect(aliceAmount.toFixed()).to.be.equal(expected)
				})
				it(`Bob's withdrawable interest is 20% of interest since the first deposit`, async () => {
					await mine(3)
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(bobFirstTokenId)
						.then(toBigNumber)
					const expected = await calc(bobFirstTokenId)
					expect(bobAmount.toFixed()).to.be.equal(expected)
				})
			})
			describe('after withdrawal', () => {
				before(async () => {
					await dev.lockup.withdrawByPosition(aliceFirstTokenId, 0, {
						from: alice,
					})
					await dev.lockup.withdrawByPosition(bobFirstTokenId, 0, { from: bob })
					await mine(3)
				})
				it(`Alice's withdrawable interest is 80% of current interest`, async () => {
					const aliceAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
						.then(toBigNumber)
					const expected = await calc(aliceFirstTokenId)

					expect(aliceAmount.toFixed()).to.be.equal(expected)
				})
				it(`Bob's withdrawable interest is 20% of current interest`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(bobFirstTokenId)
						.then(toBigNumber)
					const expected = await calc(bobFirstTokenId)

					expect(bobAmount.toFixed()).to.be.equal(expected)
				})
			})
			describe('additional staking', () => {
				before(async () => {
					await dev.lockup.depositToPosition(bobFirstTokenId, 12500 * 0.3, {
						from: bob,
					})
					await mine(3)
				})
				it(`Bob does staking 30% of the all Property's total lockups, Bob's share become ${
					625000 / 16250
				}%, Alice's share become ${1000000 / 16250}%`, async () => {
					const alicePosition = await dev.sTokenManager.positions(
						aliceFirstTokenId
					)
					const aliceBalance = toBigNumber(alicePosition[1])
					const bobPosition = await dev.sTokenManager.positions(bobFirstTokenId)
					const bobBalance = toBigNumber(bobPosition[1])

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
						.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
						.then(toBigNumber)
					const expected = await calc(aliceFirstTokenId)

					expect(aliceAmount.toFixed()).to.be.equal(expected)
				})
				it(`Bob's withdrawable interest is 20% of prev interest and ${
					625000 / 16250
				}% of current interest`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(bobFirstTokenId)
						.then(toBigNumber)
					const expected = await calc(bobFirstTokenId)

					expect(bobAmount.toFixed()).to.be.equal(expected)
				})
			})
			describe('additional staking', () => {
				before(async () => {
					await dev.lockup.depositToProperty(property3.address, 16250 * 0.6, {
						from: alice,
					})
					await mine(3)
				})
				it(`Alice does staking 60% of the all Property's total lockups, Alice's share become ${
					1975000 / 26000
				}%, Bob's share become ${625000 / 26000}%`, async () => {
					const aliceProperty1Position = await dev.sTokenManager.positions(
						aliceFirstTokenId
					)
					const aliceProperty1Balance = toBigNumber(aliceProperty1Position[1])
					const aliceProperty3Position = await dev.sTokenManager.positions(
						aliceSecoundTokenId
					)
					const aliceProperty3Balance = toBigNumber(aliceProperty3Position[1])
					const bobProperty2Position = await dev.sTokenManager.positions(
						bobFirstTokenId
					)
					const bobProperty2Balance = toBigNumber(bobProperty2Position[1])

					expect(19750).to.be.equal(
						toBigNumber(26000).times(toBigNumber(19750).div(26000)).toNumber()
					)
					expect(
						aliceProperty1Balance.plus(aliceProperty3Balance).toFixed()
					).to.be.equal('19750')
					expect(6250).to.be.equal(
						toBigNumber(26000).times(toBigNumber(6250).div(26000)).toNumber()
					)
					expect(bobProperty2Balance.toFixed()).to.be.equal('6250')
				})
			})
			describe('after additional staking', () => {
				it(`Alice's withdrawable interest is 80% of two prev interest and ${
					1000000 / 16250
				}% of prev interest and ${
					1975000 / 26000
				}% of current interest`, async () => {
					const aliceAmount = await Promise.all([
						dev.lockup
							.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
							.then(toBigNumber),
						dev.lockup
							.calculateWithdrawableInterestAmountByPosition(
								aliceSecoundTokenId
							)
							.then(toBigNumber),
					])
					const res1 = await calc(aliceFirstTokenId)
					const res2 = await calc(aliceSecoundTokenId)

					expect(aliceAmount[0].plus(aliceAmount[1]).toFixed()).to.be.equal(
						toBigNumber(res1).plus(res2).toFixed()
					)
				})
				it(`Bob's withdrawable interest is 20% of two prev interest and ${
					625000 / 16250
				}% of prev interest and ${
					625000 / 26000
				}% of current interest`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(bobFirstTokenId)
						.then(toBigNumber)
					const expected = await calc(bobFirstTokenId)

					expect(bobAmount.toFixed()).to.be.equal(expected)
				})
			})
			describe('after withdrawal stakes', () => {
				before(async () => {
					const aliceProperty1Position = await dev.sTokenManager.positions(
						aliceFirstTokenId
					)
					const aliceProperty1Balance = toBigNumber(aliceProperty1Position[1])
					const aliceProperty3Position = await dev.sTokenManager.positions(
						aliceSecoundTokenId
					)
					const aliceProperty3Balance = toBigNumber(aliceProperty3Position[1])
					const bobProperty2Position = await dev.sTokenManager.positions(
						bobFirstTokenId
					)
					const bobProperty2Balance = toBigNumber(bobProperty2Position[1])
					await dev.lockup.withdrawByPosition(
						aliceFirstTokenId,
						aliceProperty1Balance,
						{
							from: alice,
						}
					)
					await mine(3)
					await dev.lockup.withdrawByPosition(
						aliceSecoundTokenId,
						aliceProperty3Balance,
						{
							from: alice,
						}
					)
					await mine(3)
					await dev.lockup.withdrawByPosition(
						bobFirstTokenId,
						bobProperty2Balance,
						{
							from: bob,
						}
					)
					await mine(3)
				})
				it(`Alice's withdrawable interest`, async () => {
					const aliceAmount = await Promise.all([
						dev.lockup
							.calculateWithdrawableInterestAmountByPosition(aliceFirstTokenId)
							.then(toBigNumber),
						dev.lockup
							.calculateWithdrawableInterestAmountByPosition(
								aliceSecoundTokenId
							)
							.then(toBigNumber),
					])
					const res1 = await calc(aliceFirstTokenId)
					const res2 = await calc(aliceSecoundTokenId)

					expect(aliceAmount[0].plus(aliceAmount[1]).toFixed()).to.be.equal(
						toBigNumber(res1).plus(res2).toFixed()
					)
				})
				it(`Bob's withdrawable interest`, async () => {
					const bobAmount = await dev.lockup
						.calculateWithdrawableInterestAmountByPosition(bobFirstTokenId)
						.then(toBigNumber)
					const expected = await calc(bobFirstTokenId)

					expect(bobAmount.toFixed()).to.be.equal(expected)
				})
			})
		})
	})
})
