import {DevProtocolInstance} from '../test-lib/instance'
import BigNumber from 'bignumber.js'
import {PropertyInstance} from '../../types/truffle-contracts'
import {getPropertyAddress} from '../test-lib/utils/log'
import {
	validateErrorMessage,
	validatePauseErrorMessage,
	validatePauseOnlyOwnerErrorMessage,
	validateAddressErrorMessage,
} from '../test-lib/utils/error'

contract('Allocator', ([deployer, user1, dummyLockup, dummyWithdraw]) => {
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
		it('If the difference between the start and end numbers is not appropriate, an error occurs.', async () => {
			const [dev, property] = await init()
			const res = await dev.allocator
				.calculate(property.address, 0, 1)
				.catch((err: Error) => err)
			validateErrorMessage(res, 'SafeMath: subtraction overflow', false)
		})
		it('If the difference between the start and end numbers is not appropriate, an error occurs.', async () => {
			const [dev, property] = await init()
			const res = await dev.allocator.calculate(property.address, 1, 1)
			expect(res[0].toNumber()).to.be.equal(0)
			expect(res[1].toNumber()).to.be.equal(0)
			expect(res[2].toNumber()).to.be.equal(0)
			expect(res[3].toNumber()).to.be.equal(0)
		})
		it('Returns holders and stakers rewards', async () => {
			const [dev, property] = await init()
			const res = await dev.allocator.calculate(property.address, 10000, 10500)
			expect(res[0].toString()).to.be.equal('50000000000000000000000')
			expect(res[1].toNumber()).to.be.equal(0)
			expect(res[2].toString()).to.be.equal('50000000000000000000000')
			expect(res[3].toNumber()).to.be.equal(0)
		})
		it.only('teteteat', async () => {
			const [dev, property] = await init()
			await dev.dev.deposit(property.address, 1000000)
			const res = await dev.allocator.calculate(property.address, 10000, 10500)
			console.log(res[0].toString())
			console.log(res[1].toString())
			console.log(res[2].toString())
			console.log(res[3].toString())
			expect(res[0].toString()).to.be.equal('45000000000000450000000')
			expect(res[1].toString()).to.be.equal('5000000000000050000000')
			expect(res[2].toString()).to.be.equal('45000000000000450000000')
			expect(res[3].toString()).to.be.equal('5000000000000050000000')
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
			expect(res).to.be.equal(false)
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
		const _init = async (): Promise<
			[DevProtocolInstance, PropertyInstance]
		> => {
			const dev = new DevProtocolInstance(deployer)
			await dev.generateAddressConfig()
			await Promise.all([
				dev.generateAllocator(),
				dev.generatePropertyFactory(),
				dev.generatePropertyGroup(),
				dev.generateVoteTimes(),
				dev.generateVoteTimesStorage(),
				dev.generatePolicyFactory(),
				dev.generatePolicyGroup(),
				dev.generatePolicySet(),
			])
			const policy = await artifacts.require('PolicyTestForAllocator').new()
			await dev.policyFactory.create(policy.address)
			const propertyAddress = getPropertyAddress(
				await dev.propertyFactory.create('test', 'TEST', deployer)
			)
			const [property] = await Promise.all([
				artifacts.require('Property').at(propertyAddress),
			])
			await dev.addressConfig.setLockup(dummyLockup)
			await dev.addressConfig.setWithdraw(dummyWithdraw)
			return [dev, property]
		}

		describe('validate', () => {
			// The first argument is guaranteed to be a property address on the caller, so we won't test it here
			it('No error when called from a Lockup contract.', async () => {
				const [dev, property] = await _init()
				await dev.allocator.validateTargetPeriod(property.address, 0, 100, {
					from: dummyLockup,
				})
			})
			it('No error when called from a Withdraw contract.', async () => {
				const [dev, property] = await _init()
				await dev.allocator.validateTargetPeriod(property.address, 0, 100, {
					from: dummyWithdraw,
				})
			})
			it('An error occurs when a contract other than Lockup or Withdraw is called.', async () => {
				const [dev, property] = await _init()
				const res = await dev.allocator
					.validateTargetPeriod(property.address, 0, 100)
					.catch((err: Error) => err)
				validateAddressErrorMessage(res)
			})
		})
		describe('allocatable', () => {
			it('If the range of block numbers is narrow, an error will occur on allocate and the function itself will fail.', async () => {
				const [dev, property] = await _init()
				const res = await dev.allocator
					.validateTargetPeriod(property.address, 0, 2, {
						from: dummyLockup,
					})
					.catch((err: Error) => err)
				validateErrorMessage(res, 'outside the target period')
			})
		})
	})
})
