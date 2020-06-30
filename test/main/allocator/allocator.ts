import BigNumber from 'bignumber.js'
// Import {expect, use} from 'chai'
// import {Contract} from 'ethers'
import {MockProvider} from 'ethereum-waffle'
import {DevProtocolInstance} from '../../test-lib/instance'
import * as PolicyTestForAllocator from '../../../build/contracts/PolicyTestForAllocator.json'

describe('Commitment', () => {
	const [wallet] = new MockProvider().getWallets()
	const init = async (): Promise<[DevProtocolInstance]> => {
		const dev = new DevProtocolInstance(wallet)
		console.log(1)
		await dev.generateAddressConfig()
		// Console.log(2)
		// await dev.generateAllocator()
		// console.log(3)
		// await dev.generateMarketFactory()
		// console.log(4)
		// await dev.generateMarketGroup()
		// console.log(5)
		// await dev.generateMetricsFactory()
		// console.log(6)
		// await dev.generateMetricsGroup()
		// console.log(7)
		// await dev.generateLockup()
		console.log(8)
		await dev.generateLockupStorage()
		console.log(9)
		await dev.generateWithdraw()
		console.log(10)
		await dev.generateWithdrawStorage()
		console.log(11)
		await dev.generatePropertyFactory()
		console.log(12)
		await dev.generatePropertyGroup()
		console.log(13)
		await dev.generateVoteTimes()
		console.log(14)
		await dev.generateVoteTimesStorage()
		console.log(15)
		await dev.generateVoteCounter()
		console.log(16)
		await dev.generateVoteCounterStorage()
		console.log(17)
		await dev.generatePolicyFactory()
		console.log(18)
		await dev.generatePolicyGroup()
		console.log(19)
		await dev.generatePolicySet()
		console.log(20)
		await dev.generateDev()
		console.log(21)

		// Await Promise.all([
		// 	dev.generateAllocator(),
		// 	dev.generateMarketFactory(),
		// 	dev.generateMarketGroup(),
		// 	dev.generateMetricsFactory(),
		// 	dev.generateMetricsGroup(),
		// 	dev.generateLockup(),
		// 	dev.generateLockupStorage(),
		// 	dev.generateWithdraw(),
		// 	dev.generateWithdrawStorage(),
		// 	dev.generatePropertyFactory(),
		// 	dev.generatePropertyGroup(),
		// 	dev.generateVoteTimes(),
		// 	dev.generateVoteTimesStorage(),
		// 	dev.generateVoteCounter(),
		// 	dev.generateVoteCounterStorage(),
		// 	dev.generatePolicyFactory(),
		// 	dev.generatePolicyGroup(),
		// 	dev.generatePolicySet(),
		// 	dev.generateDev(),
		// ])
		await dev.dev.mint(wallet.address, new BigNumber(1e18).times(10000000))
		await dev.createPolicy(PolicyTestForAllocator)
		// Const policy = await artifacts.require('PolicyTestForAllocator').new()

		// await dev.policyFactory.create(policy.address)
		// const propertyAddress = getPropertyAddress(
		// 	await dev.propertyFactory.create('test', 'TEST', deployer)
		// )
		// const [property] = await Promise.all([
		// 	artifacts.require('Property').at(propertyAddress),
		// ])
		return [dev]
	}

	describe('Allocator: calculateMaxRewardsPerBlock', () => {
		it('With no authentication or lockup, no DEV will be mint.', async () => {
			await init()
		})
	})
})
// Import {DevProtocolInstance} from '../test-lib/instance'
// import BigNumber from 'bignumber.js'
// import {toBigNumber} from '../test-lib/utils/common'
// import {PropertyInstance} from '../../types/truffle-contracts'
// import {getPropertyAddress, getMarketAddress} from '../test-lib/utils/log'
// import {
// 	validateAddressErrorMessage,
// 	validatePauseErrorMessage,
// 	validatePauseOnlyOwnerErrorMessage,
// } from '../test-lib/utils/error'

// contract('Allocator', ([deployer, user1, propertyAddress, propertyFactory]) => {
// 	const marketContract = artifacts.require('Market')
// 	const init = async (): Promise<[DevProtocolInstance, PropertyInstance]> => {
// 		const dev = new DevProtocolInstance(deployer)
// 		await dev.generateAddressConfig()
// 		await Promise.all([
// 			dev.generateAllocator(),
// 			dev.generateAllocatorStorage(),
// 			dev.generateMarketFactory(),
// 			dev.generateMarketGroup(),
// 			dev.generateMetricsFactory(),
// 			dev.generateMetricsGroup(),
// 			dev.generateLockup(),
// 			dev.generateLockupStorage(),
// 			dev.generateWithdraw(),
// 			dev.generateWithdrawStorage(),
// 			dev.generatePropertyFactory(),
// 			dev.generatePropertyGroup(),
// 			dev.generateVoteTimes(),
// 			dev.generateVoteTimesStorage(),
// 			dev.generateVoteCounter(),
// 			dev.generateVoteCounterStorage(),
// 			dev.generatePolicyFactory(),
// 			dev.generatePolicyGroup(),
// 			dev.generatePolicySet(),
// 			dev.generateDev(),
// 		])
// 		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
// 		const policy = await artifacts.require('PolicyTestForAllocator').new()

// 		await dev.policyFactory.create(policy.address)
// 		const propertyAddress = getPropertyAddress(
// 			await dev.propertyFactory.create('test', 'TEST', deployer)
// 		)
// 		const [property] = await Promise.all([
// 			artifacts.require('Property').at(propertyAddress),
// 		])
// 		return [dev, property]
// 	}

// 	const authenticate = async (
// 		dev: DevProtocolInstance,
// 		propertyAddress: string
// 	): Promise<void> => {
// 		const behavuor = await dev.getMarket('MarketTest3', user1)
// 		let createMarketResult = await dev.marketFactory.create(behavuor.address)
// 		const marketAddress = getMarketAddress(createMarketResult)
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const marketInstance = await marketContract.at(marketAddress)
// 		await marketInstance.authenticate(
// 			propertyAddress,
// 			'id-key',
// 			'',
// 			'',
// 			'',
// 			'',
// 			{from: deployer}
// 		)
// 	}

// 	describe('Allocator: calculateMaxRewardsPerBlock', () => {
// 		it('With no authentication or lockup, no DEV will be mint.', async () => {
// 			const [dev] = await init()
// 			const res = await dev.allocator.calculateMaxRewardsPerBlock()
// 			expect(res.toNumber()).to.be.equal(0)
// 		})
// 		it('A DEV is not minted just by certifying it to Market.', async () => {
// 			const [dev, property] = await init()
// 			await authenticate(dev, property.address)
// 			const res = await dev.allocator.calculateMaxRewardsPerBlock()
// 			expect(res.toNumber()).to.be.equal(0)
// 		})
// 		it('Dev is minted if staking and authenticated the Market.', async () => {
// 			const [dev, property] = await init()
// 			await authenticate(dev, property.address)
// 			await dev.dev.deposit(property.address, 10000)
// 			const res = await dev.allocator.calculateMaxRewardsPerBlock()
// 			expect(res.toNumber()).to.be.equal(10000)
// 		})
// 	})

// 	describe('Allocator: beforeBalanceChange', () => {
// 		it('If the first argument is a non-property address, an error occurs..', async () => {
// 			const [dev] = await init()
// 			const res = await dev.allocator
// 				.beforeBalanceChange(user1, user1, user1)
// 				.catch((err: Error) => err)
// 			validateAddressErrorMessage(res)
// 		})
// 		it("If run the Allocator's beforeBalanceChange Withdraw's beforeBalanceChange is executed.", async () => {
// 			const [dev, property] = await init()
// 			await authenticate(dev, property.address)
// 			await dev.dev.deposit(property.address, 10000)
// 			const totalSupply = await property.totalSupply().then(toBigNumber)
// 			await property.transfer(user1, totalSupply.times(0.2), {
// 				from: deployer,
// 			})
// 			await dev.addressConfig.setPropertyFactory(propertyFactory)
// 			await dev.propertyGroup.addGroup(propertyAddress, {
// 				from: propertyFactory,
// 			})
// 			const beforeValue = await dev.withdrawStorage.getLastCumulativeGlobalHoldersPrice(
// 				property.address,
// 				deployer
// 			)
// 			await dev.allocator.beforeBalanceChange(
// 				property.address,
// 				deployer,
// 				user1,
// 				{from: propertyAddress}
// 			)
// 			const afterValue = await dev.withdrawStorage.getLastCumulativeGlobalHoldersPrice(
// 				property.address,
// 				deployer
// 			)
// 			// We'll just check the fact that it's "done" here.
// 			expect(beforeValue.toString() !== afterValue.toString()).to.be.equal(true)
// 		})
// 	})

// 	describe('Allocator; pause', () => {
// 		it('pause and unpause this contract', async () => {
// 			const [dev] = await init()
// 			await dev.allocator.pause()
// 			const res = await dev.allocator
// 				.calculateMaxRewardsPerBlock()
// 				.catch((err: Error) => err)
// 			validatePauseErrorMessage(res, false)
// 			await dev.allocator.unpause()
// 			await dev.allocator.calculateMaxRewardsPerBlock()
// 		})

// 		it('Should fail to pause this contract when sent from the non-owner account', async () => {
// 			const [dev] = await init()
// 			const res = await dev.allocator
// 				.pause({from: user1})
// 				.catch((err: Error) => err)
// 			validatePauseOnlyOwnerErrorMessage(res)
// 		})
// 	})
// })
