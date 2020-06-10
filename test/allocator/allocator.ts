import {DevProtocolInstance} from '../test-lib/instance'
import BigNumber from 'bignumber.js'
import {PropertyInstance} from '../../types/truffle-contracts'
import {getPropertyAddress} from '../test-lib/utils/log'
import {
	validatePauseErrorMessage,
	validatePauseOnlyOwnerErrorMessage,
} from '../test-lib/utils/error'

contract('Allocator', ([deployer, user1]) => {
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

	describe('Allocator: calculate', () => {
		it('Should fail to calculate when the first argument is not a Property')
		it('Returns holders and stakers rewards')

		describe('When the first argument is Metrics', () => {
			it(
				'Returns holders and stakers rewards, begin blocks get by AllocatorStorage'
			)
		})
	})

	describe('Allocator; allocation', () => {
		it(`
			last allocation block is 5760,
			mint per block is 50000,
			locked-up is 300,
			total locked-up is 7406907;
			the result is ${5760 * 50000 * (300 / 7406907)}`, async () => {
			const [dev] = await init()
			const result = await dev.allocator.allocation(5760, 50000, 300, 7406907)
			expect(result.toNumber()).to.be.equal(~~(5760 * 50000 * (300 / 7406907)))
		})
	})

	describe('Allocator; pause', () => {
		it('pause and unpause this contract', async () => {
			const [dev, property] = await init()
			await dev.allocator.pause()
			const res = await dev.allocator
				.calculate(property.address, 1, 1000)
				.catch((err: Error) => err)
			validatePauseErrorMessage(res)
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

	describe('Allocator; allocatable', () => {
		it('Returns false when the Property is the target of the abstention penalty', async () => {
			const [dev, property] = await init()
			const marketBehavior = await artifacts
				.require('MarketTest2')
				.new(dev.addressConfig.address)
			await dev.marketFactory.create(marketBehavior.address)
			// eslint-disable-next-line no-undef
			const fromBlock: number = await web3.eth.getBlockNumber()
			const res = await dev.allocator.allocatable(
				property.address,
				fromBlock,
				fromBlock + 1
			)
			expect(res).to.be.equal(true)
		})
		it('Returns true when the Property is not the target of the abstention penalty', async () => {
			const [dev, property] = await init()
			const marketBehavior = await artifacts
				.require('MarketTest2')
				.new(dev.addressConfig.address)
			await dev.marketFactory.create(marketBehavior.address)
			// eslint-disable-next-line no-undef
			const fromBlock: number = await web3.eth.getBlockNumber()
			const res = await dev.allocator.allocatable(
				property.address,
				fromBlock + 11,
				fromBlock + 20
			)
			expect(res).to.be.equal(true)
		})
	})

	describe('Allocator; validateTargetPeriod', () => {
		// TODO: Add tests
		it('todo')
	})
})
