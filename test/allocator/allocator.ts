import {DevProtocolInstance} from '../test-lib/instance'
import BigNumber from 'bignumber.js'
import {PropertyInstance} from '../../types/truffle-contracts'
import {getPropertyAddress, getMarketAddress} from '../test-lib/utils/log'
import {
	validatePauseErrorMessage,
	validatePauseOnlyOwnerErrorMessage,
} from '../test-lib/utils/error'

contract('Allocator', ([deployer, user1]) => {
	const marketContract = artifacts.require('Market')
	const init = async (): Promise<[DevProtocolInstance, PropertyInstance]> => {
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
		const policy = await artifacts.require('PolicyTestForAllocator').new()

		await dev.policyFactory.create(policy.address)
		const propertyAddress = getPropertyAddress(
			await dev.propertyFactory.create('test', 'TEST', deployer)
		)
		const [property] = await Promise.all([
			artifacts.require('Property').at(propertyAddress),
		])
		return [dev, property]
	}

	const authenticate = async (
		dev: DevProtocolInstance,
		propertyAddress: string
	): Promise<void> => {
		const behavuor = await dev.getMarket('MarketTest3', user1)
		let createMarketResult = await dev.marketFactory.create(behavuor.address)
		const marketAddress = getMarketAddress(createMarketResult)
		// eslint-disable-next-line @typescript-eslint/await-thenable
		const marketInstance = await marketContract.at(marketAddress)
		await marketInstance.authenticate(
			propertyAddress,
			'id-key',
			'',
			'',
			'',
			'',
			{from: deployer}
		)
	}

	describe('Allocator: calculateMaxRewardsPerBlock', () => {
		it('With no authentication or lockup, no DEV will be mint.', async () => {
			const [dev] = await init()
			const res = await dev.allocator.calculateMaxRewardsPerBlock()
			expect(res[0].toNumber()).to.be.equal(0)
			expect(res[1].toNumber()).to.be.equal(0)
			expect(res[2].toNumber()).to.be.equal(0)
		})
		it('A DEV is not minted just by certifying it to Market.', async () => {
			const [dev, property] = await init()
			await authenticate(dev, property.address)
			const res = await dev.allocator.calculateMaxRewardsPerBlock()
			expect(res[0].toNumber()).to.be.equal(0)
			expect(res[1].toNumber()).to.be.equal(0)
			expect(res[2].toNumber()).to.be.equal(0)
		})
		it('Dev is minted if staking and authenticated the Market.', async () => {
			const [dev, property] = await init()
			await authenticate(dev, property.address)
			await dev.dev.deposit(property.address, 10000)
			const res = await dev.allocator.calculateMaxRewardsPerBlock()
			expect(res[0].toNumber()).to.be.equal(9000)
			expect(res[1].toNumber()).to.be.equal(1000)
			expect(res[2].toNumber()).to.be.equal(10000)
		})
	})

	describe('Allocator; pause', () => {
		it('pause and unpause this contract', async () => {
			const [dev, property] = await init()
			await dev.allocator.pause()
			const res = await dev.allocator
				.calculate(property.address, 0, 1000)
				.catch((err: Error) => err)
			validatePauseErrorMessage(res, false)
			await dev.allocator.unpause()
			await dev.allocator.calculate(property.address, 1, 1000)
		})

		it('Should fail to pause this contract when sent from the non-owner account', async () => {
			const [dev] = await init()
			const res = await dev.allocator
				.pause({from: user1})
				.catch((err: Error) => err)
			validatePauseOnlyOwnerErrorMessage(res)
		})
	})
})
