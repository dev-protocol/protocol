/* eslint-disable max-params */
import { DevProtocolInstance } from '../test-lib/instance'
import {
	MetricsInstance,
	PropertyInstance,
	IPolicyInstance,
	MarketInstance,
} from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import {
	mine,
	toBigNumber,
	getBlock,
	splitValue,
} from '../test-lib/utils/common'
import {
	getWithdrawHolderAmount,
	getWithdrawHolderSplitAmount,
} from '../test-lib/utils/mint-amount'
import { getPropertyAddress, getMarketAddress } from '../test-lib/utils/log'
import { SHARE_OF_TREASURY } from '../test-lib/const'
import { getEventValue } from '../test-lib/utils/event'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
} from '../test-lib/utils/error'

contract('WithdrawTest', ([deployer, user1, user2, user3, user4]) => {
	const init = async (
		generateWithdrawTest = false
	): Promise<
		[
			DevProtocolInstance,
			MetricsInstance,
			PropertyInstance,
			IPolicyInstance,
			MarketInstance
		]
	> => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.generateDevMinter()
		await Promise.all([
			dev.generateAllocator(),
			dev.generateMarketFactory(),
			dev.generateMarketGroup(),
			dev.generateMetricsFactory(),
			dev.generateMetricsGroup(),
			dev.generateLockup(),
			dev.generatePropertyFactory(),
			dev.generatePropertyGroup(),
			dev.generatePolicyFactory(),
			dev.generatePolicyGroup(),
		])
		if (generateWithdrawTest) {
			await dev.generateWithdrawTest()
		} else {
			await dev.generateWithdraw()
		}

		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		await dev.dev.mint(user3, new BigNumber(1e18).times(10000000))

		const policyAddress = await dev.generatePolicy('PolicyTestForWithdraw')
		// eslint-disable-next-line @typescript-eslint/await-thenable
		const policy = await artifacts
			.require('PolicyTestForWithdraw')
			.at(policyAddress)
		const propertyAddress = getPropertyAddress(
			await dev.propertyFactory.create('test', 'TEST', deployer)
		)
		const [property] = await Promise.all([
			artifacts.require('Property').at(propertyAddress),
		])
		await dev.metricsGroup.__setMetricsCountPerProperty(property.address, 1)
		const marketBehavior = await artifacts
			.require('MarketTest1')
			.new(dev.addressConfig.address)
		const marketAddress = getMarketAddress(
			await dev.marketFactory.create(marketBehavior.address)
		)
		await marketBehavior.setAssociatedMarket(marketAddress)
		const [market] = await Promise.all([
			artifacts.require('Market').at(marketAddress),
		])
		market
			.authenticate(property.address, 'id1', '', '', '', '')
			.catch(console.error)
		const metricsAddress = await (async () =>
			getEventValue(dev.metricsFactory)('Create', '_metrics'))()
		const [metrics] = await Promise.all([
			artifacts.require('Metrics').at(metricsAddress as string),
		])
		await dev.lockup.update()

		return [dev, metrics, property, policy, market]
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
				.withdraw(property.address, { from: user1 })
				.catch((err: Error) => err)
			validateErrorMessage(res, 'withdraw value is 0')
		})
		describe('withdrawing interest amount', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance

			const alis = user1
			const bob = deployer

			before(async () => {
				;[dev, , property] = await init()
				await dev.dev.mint(alis, new BigNumber(1e18).times(10000000))
				await dev.dev.deposit(property.address, '10000000000000000000000', {
					from: alis,
				})
			})

			it(`withdrawing sender's withdrawable interest full amount`, async () => {
				const beforeBalance = await dev.dev
					.balanceOf(deployer)
					.then(toBigNumber)
				const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)
				await mine(10)
				const amount = await dev.withdraw
					.calculateWithdrawableAmount(property.address, bob)
					.then(toBigNumber)
				await dev.withdraw.withdraw(property.address, { from: bob })
				const holderAmount = await getWithdrawHolderAmount(
					dev,
					property.address
				)
				const [oneBlockReword] = splitValue(holderAmount)
				const realAmount = amount.plus(oneBlockReword)

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
					.calculateWithdrawableAmount(property.address, bob)
					.then(toBigNumber)
				expect(amount.toFixed()).to.be.equal('0')
			})
		})
		describe('Withdraw; Withdraw is mint', () => {
			const alis = user1
			const bob = deployer
			it('Withdraw mints an ERC20 token specified in the Address Config Contract', async () => {
				const [dev, , property] = await init()
				await dev.dev.mint(alis, new BigNumber(1e18).times(10000000))
				await dev.dev.deposit(property.address, '10000000000000000000000', {
					from: alis,
				})
				const prev = await dev.dev.totalSupply().then(toBigNumber)
				const balance = await dev.dev.balanceOf(deployer).then(toBigNumber)

				await dev.withdraw.withdraw(property.address, { from: bob })

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
				await dev.dev.deposit(property.address, '10000000000000000000000', {
					from: user3,
				})
				const totalSupply = await property.totalSupply().then(toBigNumber)
				const oneBlockAmount = toBigNumber(9e19)
				const user1Share = 20
				const [deployerFirstShare] = splitValue(oneBlockAmount)
				const [deployerSecondShare] = splitValue(
					oneBlockAmount,
					SHARE_OF_TREASURY + user1Share
				)
				await property.transfer(user1, totalSupply.div(100).times(user1Share), {
					from: deployer,
				})
				await mine(1)
				const amount1 = await dev.withdraw
					.calculateWithdrawableAmount(property.address, deployer)
					.then(toBigNumber)
				const amount2 = await dev.withdraw
					.calculateWithdrawableAmount(property.address, user1)
					.then(toBigNumber)
				expect(
					deployerSecondShare
						.plus(deployerFirstShare)
						.integerValue(BigNumber.ROUND_DOWN)
						.toFixed()
				).to.be.equal(amount1.toFixed())
				expect(
					oneBlockAmount
						.div(100)
						.times(user1Share)
						.integerValue(BigNumber.ROUND_DOWN)
						.toFixed()
				).to.be.equal(amount2.toFixed())
			})
			it('The withdrawal amount is always the full amount of the withdrawable amount', async () => {
				const [dev, , property] = await init()
				await dev.dev.deposit(property.address, '10000000000000000000000', {
					from: user3,
				})
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
				await dev.withdraw.withdraw(property.address, { from: user1 })
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
					.withdraw(property.address, { from: user1 })
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
			let blockNumber: number
			const alice = deployer
			const bob = user1
			const FIRST_TRANSFER_PERCENTAGE = 20
			const SECOUND_TRANSFER_PERCENTAGE = 10

			before(async () => {
				;[dev, , property] = await init()

				const totalSupply = await property.totalSupply().then(toBigNumber)
				await property.transfer(
					bob,
					totalSupply.div(100).times(FIRST_TRANSFER_PERCENTAGE),
					{
						from: alice,
					}
				)
				await property.transfer(
					bob,
					totalSupply.div(100).times(SECOUND_TRANSFER_PERCENTAGE),
					{
						from: alice,
					}
				)
				await dev.dev.deposit(property.address, '10000000000000000000000', {
					from: user3,
				})
				blockNumber = await getBlock()
			})

			describe('Withdraw; Before increment', () => {
				it(`Alice's withdrawable amount is 70% of reward`, async () => {
					await mine(1)
					const currentBlock = await getBlock()
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const [totalAmount] = splitValue(
						toBigNumber(9e19).times(currentBlock - blockNumber),
						FIRST_TRANSFER_PERCENTAGE +
							SECOUND_TRANSFER_PERCENTAGE +
							SHARE_OF_TREASURY
					)
					expect(aliceAmount.toFixed()).to.be.equal(
						totalAmount.integerValue(BigNumber.ROUND_DOWN).toFixed()
					)
				})

				it(`Bob's withdrawable amount is 30% of reward`, async () => {
					const currentBlock = await getBlock()
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, bob)
						.then(toBigNumber)
					const totalAmount = toBigNumber(9e19).times(
						currentBlock - blockNumber
					)
					expect(bobAmount.toFixed()).to.be.equal(
						totalAmount.times(0.3).integerValue(BigNumber.ROUND_DOWN).toFixed()
					)
				})
			})

			describe('Withdraw; After increment', () => {
				it(`Alice's withdrawable amount is 70% of rewardd`, async () => {
					await mine(1)
					const currentBlock = await getBlock()
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const [totalAmount] = splitValue(
						toBigNumber(9e19).times(currentBlock - blockNumber),
						FIRST_TRANSFER_PERCENTAGE +
							SECOUND_TRANSFER_PERCENTAGE +
							SHARE_OF_TREASURY
					)
					expect(aliceAmount.toFixed()).to.be.equal(
						totalAmount.integerValue(BigNumber.ROUND_DOWN).toFixed()
					)
				})

				it(`Bob's withdrawable amount is 30% of reward`, async () => {
					await mine(1)
					const currentBlock = await getBlock()
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, bob)
						.then(toBigNumber)
					const totalAmount = toBigNumber(9e19).times(
						currentBlock - blockNumber
					)
					expect(bobAmount.toFixed()).to.be.equal(
						totalAmount.times(0.3).integerValue(BigNumber.ROUND_DOWN).toFixed()
					)
				})

				it('Become 0 withdrawable amount when after withdrawing', async () => {
					await dev.withdraw.withdraw(property.address, { from: alice })
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					await dev.withdraw.withdraw(property.address, { from: bob })
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
		describe('Withdraw; Alice has sent 10% tokens to Bob after 20% tokens sent. Bob has increased from 20% tokens to 30% tokens.', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let blockNumber: number
			const alice = deployer
			const bob = user1
			const TRANSFERD_PROPERTY_TOKEN_PERCENT = 10

			before(async () => {
				;[dev, , property] = await init()

				const totalSupply = await property.totalSupply().then(toBigNumber)
				await property.transfer(
					bob,
					totalSupply.div(100).times(TRANSFERD_PROPERTY_TOKEN_PERCENT),
					{
						from: alice,
					}
				)
				await property.transfer(
					bob,
					totalSupply.div(100).times(TRANSFERD_PROPERTY_TOKEN_PERCENT),
					{
						from: alice,
					}
				)
				await dev.dev.deposit(property.address, '10000000000000000000000', {
					from: user3,
				})
				blockNumber = await getBlock()
			})

			describe('calculateWithdrawableAmount; Before sent 10% tokens', () => {
				it(`Alice's withdrawable amount is 80% of reward`, async () => {
					await mine(1)
					const currentBlock = await getBlock()
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const totalAmount = toBigNumber(9e19).times(
						currentBlock - blockNumber
					)
					const rewordPercent =
						100 -
						TRANSFERD_PROPERTY_TOKEN_PERCENT -
						TRANSFERD_PROPERTY_TOKEN_PERCENT -
						SHARE_OF_TREASURY
					expect(aliceAmount.toFixed()).to.be.equal(
						totalAmount
							.div(100)
							.times(rewordPercent)
							.integerValue(BigNumber.ROUND_DOWN)
							.toFixed()
					)
				})

				it(`Bob's withdrawable amount is 20% of reward`, async () => {
					const currentBlock = await getBlock()
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, bob)
						.then(toBigNumber)
					const totalAmount = toBigNumber(9e19).times(
						currentBlock - blockNumber
					)
					expect(bobAmount.toFixed()).to.be.equal(
						totalAmount.times(0.2).integerValue(BigNumber.ROUND_DOWN).toFixed()
					)
				})
			})

			describe('calculateWithdrawableAmount; After sent 10% tokens', () => {
				let totalAmountPerBlock: BigNumber
				before(async () => {
					const currentBlock = await getBlock()
					totalAmountPerBlock = toBigNumber(9e19).times(
						currentBlock - blockNumber
					)
					const totalSupply = await property.totalSupply().then(toBigNumber)
					await property.transfer(
						bob,
						totalSupply.div(100).times(TRANSFERD_PROPERTY_TOKEN_PERCENT),
						{
							from: alice,
						}
					)
					await mine(1)
				})
				it(`Alice's withdrawable amount is 70% of rewardd`, async () => {
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const [amountPerBlockForAlice] = splitValue(
						totalAmountPerBlock,
						TRANSFERD_PROPERTY_TOKEN_PERCENT +
							TRANSFERD_PROPERTY_TOKEN_PERCENT +
							SHARE_OF_TREASURY
					)
					const [latestAmountPerBlockForAlice] = splitValue(
						totalAmountPerBlock,
						TRANSFERD_PROPERTY_TOKEN_PERCENT +
							TRANSFERD_PROPERTY_TOKEN_PERCENT +
							TRANSFERD_PROPERTY_TOKEN_PERCENT +
							SHARE_OF_TREASURY
					)
					expect(aliceAmount.toFixed()).to.be.equal(
						amountPerBlockForAlice
							.integerValue(BigNumber.ROUND_DOWN)
							.plus(amountPerBlockForAlice.integerValue(BigNumber.ROUND_DOWN))
							.plus(
								latestAmountPerBlockForAlice.integerValue(BigNumber.ROUND_DOWN)
							)
							.toFixed()
					)
				})

				it(`Bob's withdrawable amount is 30% of reward`, async () => {
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, bob)
						.then(toBigNumber)
					expect(bobAmount.toFixed()).to.be.equal(
						totalAmountPerBlock
							.times(0.2)
							.integerValue(BigNumber.ROUND_DOWN)
							.plus(
								totalAmountPerBlock
									.times(0.2)
									.integerValue(BigNumber.ROUND_DOWN)
							)
							.plus(
								totalAmountPerBlock
									.times(0.3)
									.integerValue(BigNumber.ROUND_DOWN)
							)
							.toFixed()
					)
				})

				it('Become 0 withdrawable amount when after withdrawing', async () => {
					await dev.withdraw.withdraw(property.address, { from: alice })
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					await dev.withdraw.withdraw(property.address, { from: bob })
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, bob)
						.then(toBigNumber)

					expect(aliceAmount.toFixed()).to.be.equal('0')
					expect(bobAmount.toFixed()).to.be.equal('0')
				})
			})
		})

		describe('Transferring the property creates an event.', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			const alice = deployer
			const bob = user1

			before(async () => {
				;[dev, , property] = await init()
			})

			it(`event is generated`, async () => {
				const totalSupply = await property.totalSupply().then(toBigNumber)
				property
					.transfer(bob, totalSupply.times(0.2), {
						from: alice,
					})
					.catch(console.error)
				const [_property, _from, _to] = await Promise.all([
					getEventValue(dev.withdraw)('PropertyTransfer', '_property'),
					getEventValue(dev.withdraw)('PropertyTransfer', '_from'),
					getEventValue(dev.withdraw)('PropertyTransfer', '_to'),
				])
				expect(_property).to.be.equal(property.address)
				expect(_from).to.be.equal(alice)
				expect(_to).to.be.equal(bob)
			})
		})
	})
	describe('Withdraw; calculateWithdrawableAmount, calculateRewardAmount', () => {
		type calcResult = {
			readonly value: BigNumber
			readonly reword: BigNumber
			readonly cap: BigNumber
			readonly allReward: BigNumber
		}
		type Calculator = (
			prop: PropertyInstance,
			account: string
		) => Promise<calcResult>
		const createCalculator =
			(dev: DevProtocolInstance): Calculator =>
			async (prop: PropertyInstance, account: string): Promise<calcResult> => {
				const [reword, cap] = await dev.lockup
					.calculateRewardAmount(prop.address)
					.then(to2BigNumbers)
				const [lastReward, pending, lastRewardCap, totalSupply, balanceOfUser] =
					await Promise.all([
						dev.activeWithdraw.getStorageLastWithdrawnReward(
							prop.address,
							account
						),
						dev.activeWithdraw.getPendingWithdrawal(prop.address, account),
						dev.activeWithdraw.getStorageLastWithdrawnRewardCap(
							prop.address,
							account
						),
						prop.totalSupply(),
						prop.balanceOf(account),
					])
				const unitPrice = reword
					.minus(lastReward)
					.times(1e18)
					.div(totalSupply)
					.integerValue(BigNumber.ROUND_DOWN)
				const allReward = unitPrice
					.times(balanceOfUser)
					.div(1e18)
					.div(1e18)
					.integerValue(BigNumber.ROUND_DOWN)
				const unitPriceCap = cap
					.minus(lastRewardCap)
					.times(1e18)
					.div(totalSupply)
					.integerValue(BigNumber.ROUND_DOWN)
				const capped = unitPriceCap
					.times(balanceOfUser)
					.div(1e18)
					.div(1e18)
					.integerValue(BigNumber.ROUND_DOWN)
				const _value = capped.isZero()
					? allReward
					: allReward.lte(capped)
					? allReward
					: capped
				const hasAssets = await dev.metricsGroup.hasAssets(prop.address)
				if (!hasAssets) {
					return {
						value: new BigNumber(0),
						reword,
						cap,
						allReward: new BigNumber(0),
					}
				}

				const legacy = await legacyWithdrawbleAmount(dev, prop, account)
				const value = _value.plus(pending).plus(legacy)
				return {
					value,
					reword,
					cap,
					allReward,
				}
			}

		const legacyWithdrawbleAmount = async (
			dev: DevProtocolInstance,
			prop: PropertyInstance,
			account: string
		): Promise<BigNumber> => {
			const [last, price, balanceOfUser] = await Promise.all([
				dev.activeWithdraw.getLastWithdrawalPrice(prop.address, account),
				dev.activeWithdraw.getCumulativePrice(prop.address),
				prop.balanceOf(account),
			])
			const priceGap = toBigNumber(price)
				.minus(last)
				.integerValue(BigNumber.ROUND_DOWN)
			return priceGap
				.times(balanceOfUser)
				.div(1e18)
				.integerValue(BigNumber.ROUND_DOWN)
		}

		const to2BigNumbers = (v: any): [BigNumber, BigNumber] => [
			new BigNumber(v[0]),
			new BigNumber(v[1]),
		]

		const to4BigNumbers = (
			v: any
		): [BigNumber, BigNumber, BigNumber, BigNumber] => [
			new BigNumber(v[0]),
			new BigNumber(v[1]),
			new BigNumber(v[2]),
			new BigNumber(v[3]),
		]

		const validateCalculateRewardAmountData = async (
			dev: DevProtocolInstance,
			prop: PropertyInstance,
			account: string,
			result: calcResult,
			isTest = false
		): Promise<void> => {
			const instance = isTest ? dev.withdrawTest : dev.withdraw
			const [value, price, cap, allReward] = await instance
				.calculateRewardAmount(prop.address, account)
				.then(to4BigNumbers)
			expect(result.value.eq(value)).to.be.equal(true)
			expect(result.reword.eq(price)).to.be.equal(true)
			expect(result.cap.eq(cap)).to.be.equal(true)
			expect(result.allReward.eq(allReward)).to.be.equal(true)
		}

		describe('scenario; zero lockup', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let calc: Calculator

			const alice = deployer
			const bob = user1

			before(async () => {
				;[dev, , property] = await init()
				calc = createCalculator(dev)
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
					const result = await calc(property, alice)
					await validateCalculateRewardAmountData(dev, property, alice, result)
				})
			})
			describe('When Property1 is 0', () => {
				before(async () => {
					const [property2] = await Promise.all([
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
					await dev.dev.deposit(
						property2.address,
						toBigNumber(10000).times(1e18),
						{ from: bob }
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
					const result = await calc(property, alice)
					await validateCalculateRewardAmountData(dev, property, alice, result)
				})
			})
		})
		describe('scenario; unauthenticated', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let calc: Calculator

			const alice = deployer
			const bob = user1

			before(async () => {
				;[dev, , property] = await init()
				calc = createCalculator(dev)
				await dev.dev.mint(bob, new BigNumber(1e18).times(10000000))
			})

			it(`Unauthenticated property has no reward`, async () => {
				await dev.metricsGroup.__setMetricsCountPerProperty(property.address, 0)
				const aliceAmount = await dev.withdraw
					.calculateWithdrawableAmount(property.address, alice)
					.then(toBigNumber)
				expect(aliceAmount.toFixed()).to.be.equal('0')
				const result = await calc(property, alice)
				await validateCalculateRewardAmountData(dev, property, alice, result)
			})

			it(`Property that unauthenticated but already staked before DIP9 has no reward`, async () => {
				await dev.metricsGroup.__setMetricsCountPerProperty(property.address, 1)
				await dev.dev.deposit(
					property.address,
					toBigNumber(10000).times(1e18),
					{
						from: bob,
					}
				)
				await mine(1)
				await dev.dev.deposit(
					property.address,
					toBigNumber(10000).times(1e18),
					{
						from: bob,
					}
				)
				await mine(1)
				await dev.metricsGroup.__setMetricsCountPerProperty(property.address, 0)
				const aliceAmount = await dev.withdraw
					.calculateWithdrawableAmount(property.address, alice)
					.then(toBigNumber)
				expect(aliceAmount.toFixed()).to.be.equal('0')
				const result = await calc(property, alice)
				await validateCalculateRewardAmountData(dev, property, alice, result)
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
					{ from: carol }
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
					const expected = toBigNumber(9e19).times(9)
					const [reword] = splitValue(expected)
					expect(aliceAmount.toFixed()).to.be.equal(reword.toFixed())
					const result = await calc(property, alice)
					await validateCalculateRewardAmountData(dev, property, alice, result)
				})
			})
			describe('after withdrawal', () => {
				before(async () => {
					await dev.withdraw.withdraw(property.address, { from: alice })
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const result = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal(result.value.toFixed())
					await validateCalculateRewardAmountData(dev, property, alice, result)
				})
			})
			describe('after additional staking', () => {
				before(async () => {
					await dev.dev.deposit(
						property.address,
						toBigNumber(10000).times(1e18),
						{ from: carol }
					)
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const result = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal(result.value.toFixed())
					await validateCalculateRewardAmountData(dev, property, alice, result)
				})
			})
			describe('after staking withdrawal', () => {
				before(async () => {
					await dev.lockup.withdraw(
						property.address,
						await dev.lockup.getValue(property.address, carol),
						{
							from: carol,
						}
					)
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await mine(6)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const result = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal(result.value.toFixed())
					await validateCalculateRewardAmountData(dev, property, alice, result)
				})
			})
			describe('after withdrawal', () => {
				before(async () => {
					await dev.withdraw.withdraw(property.address, { from: alice })
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const result = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal('0')
					await validateCalculateRewardAmountData(dev, property, alice, result)
				})
			})
		})
		describe('scenario: multiple lockup', () => {
			let dev: DevProtocolInstance
			let property: PropertyInstance
			let blockNumber: number
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
				await dev.dev.deposit(property.address, '10000000000000000000000', {
					from: bob,
				})
				blockNumber = await getBlock()
				await dev.dev.deposit(
					property.address,
					toBigNumber('10000000000000000000000').times('0.25'),
					{
						from: carol,
					}
				)
			})

			describe('before withdrawal', () => {
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					const currentBlock = await getBlock()
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const expected = toBigNumber(9e19).times(currentBlock - blockNumber)
					const calcResult = await calc(property, alice)
					const [tmp] = splitValue(expected)
					expect(aliceAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					expect(aliceAmount.toFixed()).to.be.equal(tmp.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property,
						alice,
						calcResult
					)
				})
			})
			describe('after withdrawal', () => {
				before(async () => {
					await dev.withdraw.withdraw(property.address, { from: alice })
				})

				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property,
						alice,
						calcResult
					)
				})
			})
			describe('additional staking', () => {
				before(async () => {
					await dev.dev.deposit(property.address, 10000, { from: bob })
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property,
						alice,
						calcResult
					)
				})
			})
			describe('after staking withdrawal', () => {
				it(`Alice's withdrawable holders rewards is correct when also after withdrawal by Carol`, async () => {
					await dev.lockup.withdraw(
						property.address,
						await dev.lockup.getValue(property.address, carol),
						{
							from: carol,
						}
					)

					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property,
						alice,
						calcResult
					)
				})
				it(`Alice's withdrawable holders rewards is correct when also after withdrawal by Bob`, async () => {
					await dev.lockup.withdraw(
						property.address,
						await dev.lockup.getValue(property.address, bob),
						{
							from: bob,
						}
					)
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property, alice)
					expect(aliceAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property,
						alice,
						calcResult
					)
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
			const carol = user2
			const dave = user4

			before(async () => {
				;[dev, , property1] = await init()
				calc = createCalculator(dev)
				const aliceBalance = await dev.dev.balanceOf(alice).then(toBigNumber)
				await dev.dev.mint(bob, aliceBalance)
				await dev.dev.mint(carol, aliceBalance)
				await dev.dev.mint(dave, aliceBalance)
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

				await dev.dev.deposit(property1.address, '10000000000000000000000', {
					from: dave,
				})
				await mine(3)
			})

			describe('before withdrawal', () => {
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property4.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					expect(calcResult.value.toFixed()).to.be.equal('0')
					await validateCalculateRewardAmountData(
						dev,
						property4,
						alice,
						calcResult
					)
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
					const calcResult = await calc(property1, alice)
					expect(aliceAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property1,
						alice,
						calcResult
					)
				})
				it(`Alice does staking 2500 to Property2, Property2 is 20% of the total rewards`, async () => {
					await dev.dev.deposit(property2.address, '2500000000000000000000', {
						from: dave,
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
				it(`Alice does staking 3750 to Property3, Property1 is ${
					1000000 / 16250
				}% of the total rewards, Property2 is ${
					250000 / 16250
				}% of the total rewards`, async () => {
					await dev.dev.deposit(property3.address, '3750000000000000000000', {
						from: dave,
					})
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
					const calcResult = await calc(property1, alice)
					expect(aliceAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property1,
						alice,
						calcResult
					)
				})
			})
			describe('after withdrawal', () => {
				before(async () => {
					await dev.withdraw.withdraw(property1.address, { from: alice })
					await dev.withdraw.withdraw(property2.address, { from: bob })
					await dev.withdraw.withdraw(property3.address, { from: carol })
					await mine(3)
				})
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property4.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					expect(calcResult.value.toFixed()).to.be.equal('0')
					await validateCalculateRewardAmountData(
						dev,
						property4,
						alice,
						calcResult
					)
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property1.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property1, alice)
					expect(aliceAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property1,
						alice,
						calcResult
					)
				})
				it(`Bob's withdrawable holders rewards is correct`, async () => {
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property2.address, bob)
						.then(toBigNumber)
					const calcResult = await calc(property2, bob)
					expect(bobAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property2,
						bob,
						calcResult
					)
				})
				it(`Carol's withdrawable holders rewards is correct`, async () => {
					const carolAmount = await dev.withdraw
						.calculateWithdrawableAmount(property3.address, carol)
						.then(toBigNumber)
					const calcResult = await calc(property3, carol)
					expect(carolAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property3,
						carol,
						calcResult
					)
				})
			})
			describe('after additional staking', () => {
				before(async () => {
					await dev.dev.deposit(property1.address, '10000000000000000000000', {
						from: dave,
					})
					await dev.dev.deposit(property2.address, '10000000000000000000000', {
						from: dave,
					})
					await dev.dev.deposit(property3.address, '10000000000000000000000', {
						from: dave,
					})
					await mine(3)
				})
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property4.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					expect(calcResult.value.toFixed()).to.be.equal('0')
					await validateCalculateRewardAmountData(
						dev,
						property4,
						alice,
						calcResult
					)
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property1.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property1, alice)
					expect(aliceAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property1,
						alice,
						calcResult
					)
				})
				it(`Bob's withdrawable holders rewards is correct`, async () => {
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property2.address, bob)
						.then(toBigNumber)
					const calcResult = await calc(property2, bob)
					expect(bobAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property2,
						bob,
						calcResult
					)
				})
				it(`Carol's withdrawable holders rewards is correct`, async () => {
					const calcResult = await calc(property3, carol)
					const carolAmount = await dev.withdraw
						.calculateWithdrawableAmount(property3.address, carol)
						.then(toBigNumber)
					expect(carolAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property3,
						carol,
						calcResult
					)
				})
			})
			describe('after staking withdrawal', () => {
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property4.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					expect(calcResult.value.toFixed()).to.be.equal('0')
					await validateCalculateRewardAmountData(
						dev,
						property4,
						alice,
						calcResult
					)
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await dev.lockup.withdraw(
						property1.address,
						await dev.lockup.getValue(property1.address, dave),
						{ from: dave }
					)
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property1.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property1, alice)
					expect(aliceAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property1,
						alice,
						calcResult
					)
				})
				it(`Bob's withdrawable holders rewards is correct`, async () => {
					await dev.lockup.withdraw(
						property2.address,
						await dev.lockup.getValue(property2.address, dave),
						{ from: dave }
					)
					await mine(3)
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property2.address, bob)
						.then(toBigNumber)
					const calcResult = await calc(property2, bob)
					expect(bobAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property2,
						bob,
						calcResult
					)
				})
				it(`Carol's withdrawable holders rewards is correct`, async () => {
					await dev.lockup.withdraw(
						property3.address,
						await dev.lockup.getValue(property3.address, dave),
						{ from: dave }
					)
					await mine(3)
					const carolAmount = await dev.withdraw
						.calculateWithdrawableAmount(property3.address, carol)
						.then(toBigNumber)
					const calcResult = await calc(property3, carol)
					expect(carolAmount.toFixed()).to.be.equal(calcResult.value.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property3,
						carol,
						calcResult
					)
				})
			})
			describe('after withdrawal', () => {
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdraw
						.calculateWithdrawableAmount(property4.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property4, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					expect(calcResult.value.toFixed()).to.be.equal('0')
					await validateCalculateRewardAmountData(
						dev,
						property4,
						alice,
						calcResult
					)
				})
				it(`Alice's withdrawable holders rewards is correct`, async () => {
					await dev.withdraw.withdraw(property1.address, { from: alice })
					await mine(3)
					const aliceAmount = await dev.withdraw
						.calculateWithdrawableAmount(property1.address, alice)
						.then(toBigNumber)
					expect(aliceAmount.toFixed()).to.be.equal('0')
				})
				it(`Bob's withdrawable holders rewards is correct`, async () => {
					await dev.withdraw.withdraw(property2.address, { from: bob })
					await mine(3)
					const bobAmount = await dev.withdraw
						.calculateWithdrawableAmount(property2.address, bob)
						.then(toBigNumber)
					expect(bobAmount.toFixed()).to.be.equal('0')
				})
				it(`Carol's withdrawable holders rewards is correct`, async () => {
					await dev.withdraw.withdraw(property3.address, { from: carol })
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
			const bob = user2

			before(async () => {
				;[dev, , property] = await init(true)
				await dev.dev.mint(bob, new BigNumber(1e18).times(10000000))
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
				await dev.withdrawTest.setCumulativePriceTest(property.address, 10000)
				await dev.withdrawTest.setLastWithdrawalPriceTest(
					property.address,
					alice,
					7000
				)
			})
			describe('before withdraw interest', () => {
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdrawTest
						.calculateWithdrawableAmount(property2.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					expect(calcResult.value.toFixed()).to.be.equal('0')
					await validateCalculateRewardAmountData(
						dev,
						property2,
						alice,
						calcResult,
						true
					)
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const aliceBalance = await property.balanceOf(alice).then(toBigNumber)
					const result = await dev.withdrawTest
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const legacy = toBigNumber(10000)
						.minus(7000)
						.times(aliceBalance)
						.div(1e18)
					const calcResult = await calc(property, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					expect(legacy.toFixed()).to.be.equal(result.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property,
						alice,
						calcResult,
						true
					)
				})
			})
			describe('after withdraw interest', () => {
				before(async () => {
					await dev.withdrawTest.withdraw(property.address, { from: alice })
					await mine(3)
				})
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdrawTest
						.calculateWithdrawableAmount(property2.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					expect(calcResult.value.toFixed()).to.be.equal('0')
					await validateCalculateRewardAmountData(
						dev,
						property2,
						alice,
						calcResult,
						true
					)
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const result = await dev.withdrawTest
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const legacy = toBigNumber(0)
					const calcResult = await calc(property, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					expect(legacy.toFixed()).to.be.equal(result.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property,
						alice,
						calcResult,
						true
					)
				})
			})
			describe('after staking', () => {
				let lastBlock: BigNumber
				before(async () => {
					await dev.dev.deposit(property.address, '10000000000000000000000', {
						from: bob,
					})
					lastBlock = await getBlock().then(toBigNumber)
					await mine(3)
				})
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdrawTest
						.calculateWithdrawableAmount(property2.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					expect(calcResult.value.toFixed()).to.be.equal('0')
					await validateCalculateRewardAmountData(
						dev,
						property2,
						alice,
						calcResult,
						true
					)
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const block = await getBlock().then(toBigNumber)
					const result = await dev.withdrawTest
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const latest = toBigNumber(90)
						.times(1e18)
						.times(block.minus(lastBlock))
					const calcResult = await calc(property, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					const [tmp] = splitValue(latest)
					expect(tmp.toFixed()).to.be.equal(result.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property,
						alice,
						calcResult,
						true
					)
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
			const bob = user2

			before(async () => {
				;[dev, , property] = await init(true)
				await dev.dev.mint(bob, new BigNumber(1e18).times(10000000))
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
				// Await dev.addressConfig.setWithdraw(deployer)
				await dev.withdrawTest.setCumulativePriceTest(property.address, 10000)
				await dev.withdrawTest.setLastWithdrawalPriceTest(
					property.address,
					alice,
					7000
				)
				// Await dev.addressConfig.setWithdraw(dev.withdrawTest.address)
				await dev.dev.deposit(property.address, '10000000000000000000000', {
					from: bob,
				})
				lastBlock = await getBlock().then(toBigNumber)
			})
			describe('before withdraw interest', () => {
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdrawTest
						.calculateWithdrawableAmount(property2.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					expect(calcResult.value.toFixed()).to.be.equal('0')
					await validateCalculateRewardAmountData(
						dev,
						property2,
						alice,
						calcResult,
						true
					)
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const aliceBalance = await property.balanceOf(alice).then(toBigNumber)
					const block = await getBlock().then(toBigNumber)
					const result = await dev.withdrawTest
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const latest = toBigNumber(90)
						.times(1e18)
						.times(block.minus(lastBlock))
					const legacy = toBigNumber(10000)
						.minus(7000)
						.times(aliceBalance)
						.div(1e18)
					const calcResult = await calc(property, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					expect(latest.plus(legacy).toFixed()).to.be.equal(result.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property,
						alice,
						calcResult,
						true
					)
				})
			})
			describe('after withdraw interest', () => {
				before(async () => {
					await dev.withdrawTest.withdraw(property.address, { from: alice })
					lastBlock = await getBlock().then(toBigNumber)
					await mine(3)
				})
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdrawTest
						.calculateWithdrawableAmount(property2.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					expect(calcResult.value.toFixed()).to.be.equal('0')
					await validateCalculateRewardAmountData(
						dev,
						property2,
						alice,
						calcResult,
						true
					)
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const block = await getBlock().then(toBigNumber)
					const result = await dev.withdrawTest
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const latest = toBigNumber(90)
						.times(1e18)
						.times(block.minus(lastBlock))
					const calcResult = await calc(property, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					const [tmp] = splitValue(latest)
					expect(tmp.toFixed()).to.be.equal(result.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property,
						alice,
						calcResult,
						true
					)
				})
			})
			describe('after additional staking', () => {
				before(async () => {
					await dev.dev.deposit(property.address, '10000000000000000000000', {
						from: bob,
					})
					await mine(3)
				})
				it('No staked Property is 0 reward', async () => {
					const result = await dev.withdrawTest
						.calculateWithdrawableAmount(property2.address, alice)
						.then(toBigNumber)
					const calcResult = await calc(property2, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					expect(calcResult.value.toFixed()).to.be.equal('0')
					await validateCalculateRewardAmountData(
						dev,
						property2,
						alice,
						calcResult,
						true
					)
				})
				it(`Alice's withdrawable interest is correct`, async () => {
					const block = await getBlock().then(toBigNumber)
					const result = await dev.withdrawTest
						.calculateWithdrawableAmount(property.address, alice)
						.then(toBigNumber)
					const latest = toBigNumber(90)
						.times(1e18)
						.times(block.minus(lastBlock))
					const calcResult = await calc(property, alice)
					expect(result.toFixed()).to.be.equal(calcResult.value.toFixed())
					const [tmp] = splitValue(latest)
					expect(tmp.toFixed()).to.be.equal(result.toFixed())
					await validateCalculateRewardAmountData(
						dev,
						property,
						alice,
						calcResult,
						true
					)
				})
			})
		})
	})

	describe('Withdraw; cap', () => {
		const propertyAuthor = deployer
		const alis = user1
		const prepare = async (): Promise<
			[
				DevProtocolInstance,
				[PropertyInstance, PropertyInstance, PropertyInstance]
			]
		> => {
			const [dev, , property, , market] = await init()
			await dev.dev.mint(alis, new BigNumber(1e18).times(10000000))
			const propertyAddress2 = getPropertyAddress(
				await dev.propertyFactory.create('test2', 'TEST2', propertyAuthor)
			)
			const [property2] = await Promise.all([
				artifacts.require('Property').at(propertyAddress2),
			])
			const propertyAddress3 = getPropertyAddress(
				await dev.propertyFactory.create('test2', 'TEST2', propertyAuthor)
			)
			const [property3] = await Promise.all([
				artifacts.require('Property').at(propertyAddress3),
			])
			await market.authenticate(property2.address, 'id2', '', '', '', '')
			await market.authenticate(property3.address, 'id3', '', '', '', '')

			return [dev, [property, property2, property3]]
		}

		const calculateRewardAndCap = async (
			dev: DevProtocolInstance,
			property: PropertyInstance,
			user: string
		): Promise<[BigNumber, BigNumber]> => {
			const result = await dev.lockup.calculateRewardAmount(property.address)
			const reward = toBigNumber(result[0])
			const cap = toBigNumber(result[1])
			const lastReward = await dev.withdraw
				.getStorageLastWithdrawnReward(property.address, user)
				.then(toBigNumber)
			const lastRewardCap = await dev.withdraw
				.getStorageLastWithdrawnRewardCap(property.address, user)
				.then(toBigNumber)
			const balance = await property.balanceOf(user).then(toBigNumber)
			const totalSupply = await property.totalSupply().then(toBigNumber)
			const unitPrice = reward
				.minus(lastReward)
				.times(toBigNumber(1e18))
				.idiv(totalSupply)
			const unitPriceCap = cap.minus(lastRewardCap).idiv(totalSupply)
			const allReward = unitPrice
				.times(balance)
				.idiv(toBigNumber(1e18))
				.idiv(toBigNumber(1e18))
			const capped = unitPriceCap.times(balance).idiv(toBigNumber(1e18))
			const value = capped.isZero()
				? allReward
				: allReward.isLessThanOrEqualTo(capped)
				? allReward
				: capped
			return [value, capped]
		}

		const checkAmount = async (
			dev: DevProtocolInstance,
			property: PropertyInstance,
			user: string
		): Promise<void> => {
			await mine(1)
			const [value, capped] = await calculateRewardAndCap(dev, property, user)
			const amount = await dev.withdraw
				.calculateWithdrawableAmount(property.address, user)
				.then(toBigNumber)
			const expected = value.isGreaterThan(capped) ? capped : value
			expect(amount.toFixed()).to.be.equal(expected.toFixed())
		}

		it(`cap`, async () => {
			const [dev, [property1, property2, property3]] = await prepare()
			await dev.dev.deposit(property1.address, toBigNumber(1000000000), {
				from: alis,
			})
			await dev.dev.deposit(property2.address, toBigNumber(2000000000), {
				from: alis,
			})
			await dev.dev.deposit(property3.address, toBigNumber(3000000000), {
				from: alis,
			})

			const cap = toBigNumber(1817120592)
			await dev.updateCap(cap.toFixed())
			await checkAmount(dev, property1, propertyAuthor)
			await checkAmount(dev, property2, propertyAuthor)
			await checkAmount(dev, property3, propertyAuthor)
			await dev.dev.deposit(property1.address, toBigNumber(1000000000), {
				from: alis,
			})
			await dev.dev.deposit(property2.address, toBigNumber(2000000000), {
				from: alis,
			})
			await dev.dev.deposit(property3.address, toBigNumber(3000000000), {
				from: alis,
			})

			const cap2 = toBigNumber(3634241185)
			await dev.updateCap(cap2.toFixed())
			await checkAmount(dev, property1, propertyAuthor)
			await checkAmount(dev, property2, propertyAuthor)
			await checkAmount(dev, property3, propertyAuthor)
		})
	})

	describe('Withdraw; tresuary', () => {
		let dev: DevProtocolInstance
		let property: PropertyInstance
		let blockNumber: number
		const alice = deployer
		const bob = user1
		const FIRST_TRANSFER_PERCENTAGE = 20
		const SECOUND_TRANSFER_PERCENTAGE = 10

		before(async () => {
			;[dev, , property] = await init()

			const totalSupply = await property.totalSupply().then(toBigNumber)
			await property.transfer(
				bob,
				totalSupply.div(100).times(FIRST_TRANSFER_PERCENTAGE),
				{
					from: alice,
				}
			)
			await property.transfer(
				bob,
				totalSupply.div(100).times(SECOUND_TRANSFER_PERCENTAGE),
				{
					from: alice,
				}
			)
			await dev.dev.deposit(property.address, '10000000000000000000000', {
				from: user3,
			})
			blockNumber = await getBlock()
		})

		it(`can get your share of tresuary`, async () => {
			await mine(1)
			const currentBlock = await getBlock()
			const treasuryAmount = await dev.withdraw
				.calculateWithdrawableAmount(property.address, dev.treasury.address)
				.then(toBigNumber)
			const [, tresuryShareAmount] = splitValue(
				toBigNumber(9e19).times(currentBlock - blockNumber),
				SHARE_OF_TREASURY
			)
			expect(treasuryAmount.toFixed()).to.be.equal(
				tresuryShareAmount.integerValue(BigNumber.ROUND_DOWN).toFixed()
			)
			const beforeBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			await dev.treasury.withdraw(property.address)
			await dev.treasury.transfer()
			const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			expect(treasuryAmount.times(2).toFixed()).to.be.equal(
				afterBalance.minus(beforeBalance).toFixed()
			)
		})
	})
	describe('Withdraw; devMinter', () => {
		it('get the address of the DevMinter contract.', async () => {
			const [dev] = await init()
			const devMinterAddress = await dev.withdraw.devMinter()
			expect(devMinterAddress).to.be.equal(dev.devMinter.address)
		})
	})
})
