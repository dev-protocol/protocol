/* eslint-disable @typescript-eslint/restrict-plus-operands */
import {expect} from 'chai'
import {createMockProvider, getWallets} from 'ethereum-waffle'
import {DevProtocolInstance} from '../../test-lib/instance'
import {toBigNumber} from '../../test-lib/common'
import {
	validateAddressErrorMessage,
	validatePauseErrorMessage,
	validatePauseOnlyOwnerErrorMessage,
} from '../../test-lib/error'
import * as PolicyTestForAllocator from '../../../build/contracts/PolicyTestForAllocator.json'
import * as MarketTest3 from '../../../build/contracts/MarketTest3.json'

describe('Allocator', () => {
	const provider = createMockProvider({
		allowUnlimitedContractSize: true,
	})
	const [wallet1, wallet2, dummyPropertyFactory, dummyProperty] = getWallets(
		provider
	)
	const init = async (): Promise<DevProtocolInstance> => {
		const dev = new DevProtocolInstance(provider, wallet1)
		// Await dev.linkDecimals()
		await dev.generateAddressConfig()
		await dev.startToAddNonceOption()
		await dev.generateAllocator()
		await dev.generateMarketFactory()
		await dev.generateMarketGroup()
		await dev.generateMetricsFactory()
		await dev.generateMetricsGroup()
		await dev.generateLockup()
		await dev.generateLockupStorage()
		await dev.generateWithdraw()
		await dev.generateWithdrawStorage()
		await dev.generatePropertyFactory()
		await dev.generatePropertyGroup()
		await dev.generateVoteTimes()
		await dev.generateVoteTimesStorage()
		await dev.generateVoteCounter()
		await dev.generateVoteCounterStorage()
		await dev.generatePolicyFactory()
		await dev.generatePolicyGroup()
		await dev.generatePolicySet()
		await dev.generateDev()
		//  Dev.finishToAddNonceOption()
		await dev.dev.mint(dev.deployer.address, 10000000000000)
		await dev.policy.create(PolicyTestForAllocator)
		await dev.property.create('test', 'TEST')
		return dev
	}

	const authenticate = async (dev: DevProtocolInstance): Promise<void> => {
		const marketInstance = await dev.market.create(MarketTest3)
		await marketInstance.authenticate(
			dev.property.getOne()!.address,
			'id-key',
			'',
			'',
			'',
			''
		)
	}

	describe('Allocator: calculateMaxRewardsPerBlock', () => {
		it('With no authentication or lockup, no DEV will be mint.', async () => {
			const dev = await init()
			const res = await dev.allocator.calculateMaxRewardsPerBlock()
			expect(res.toNumber()).to.be.equal(0)
		})
		it('A DEV is not minted just by certifying it to Market.', async () => {
			const dev = await init()
			await authenticate(dev)
			const res = await dev.allocator.calculateMaxRewardsPerBlock()
			expect(res.toNumber()).to.be.equal(0)
		})
		it('Dev is minted if staking and authenticated the Market.', async () => {
			const dev = await init()
			await authenticate(dev)
			await dev.dev.deposit(dev.property.getOne()!.address, 10000)
			const res = await dev.allocator.calculateMaxRewardsPerBlock()
			expect(res.toNumber()).to.be.equal(10000)
		})
	})
	describe('Allocator: beforeBalanceChange', () => {
		it('If the first argument is a non-property address, an error occurs..', async () => {
			const dev = await init()
			const res = await dev.allocator
				.beforeBalanceChange(wallet2.address, wallet2.address, wallet2.address)
				.catch((err: Error) => err)
			validateAddressErrorMessage(res)
		})
		it("If run the Allocator's beforeBalanceChange Withdraw's beforeBalanceChange is executed.", async () => {
			const dev = await init()
			await authenticate(dev)
			const propertyInstance = dev.property.getOne()!

			await dev.dev.deposit(propertyInstance.address, 10000)
			const totalSupply = await propertyInstance.totalSupply().then(toBigNumber)
			await propertyInstance.transfer(
				wallet2.address,
				totalSupply.times(0.2).toFixed()
			)
			await dev.addressConfig.setPropertyFactory(dummyPropertyFactory.address)
			const propertyGroupOtherWallet = dev.propertyGroup.connect(
				dummyPropertyFactory
			)
			await propertyGroupOtherWallet.addGroup(dummyProperty.address)
			const beforeValue = await dev.withdrawStorage.getLastCumulativeGlobalHoldersPrice(
				propertyInstance.address,
				dev.deployer.address
			)
			const allocatorOtherWallet = dev.allocator.connect(dummyProperty)
			await allocatorOtherWallet.beforeBalanceChange(
				propertyInstance.address,
				dev.deployer.address,
				wallet2.address
			)
			const afterValue = await dev.withdrawStorage.getLastCumulativeGlobalHoldersPrice(
				propertyInstance.address,
				dev.deployer.address
			)
			// We'll just check the fact that it's "done" here.
			expect(beforeValue.toString() !== afterValue.toString()).to.be.equal(true)
		})
	})
	describe('Allocator; pause', () => {
		it('pause and unpause this contract', async () => {
			const dev = await init()
			await dev.allocator.pause()
			const res = await dev.allocator
				.calculateMaxRewardsPerBlock()
				.catch((err: Error) => err)
			validatePauseErrorMessage(res)
			await dev.allocator.unpause()
			await dev.allocator.calculateMaxRewardsPerBlock()
		})

		it('Should fail to pause this contract when sent from the non-owner account', async () => {
			const dev = await init()
			const allocatorOtherWallet = dev.allocator.connect(wallet2)

			const res = await allocatorOtherWallet.pause().catch((err: Error) => err)
			validatePauseOnlyOwnerErrorMessage(res)
		})
	})
})
