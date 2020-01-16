import {DevProtocolInstance} from '../test-lib/instance'
import BigNumber from 'bignumber.js'
import {
	getPropertyAddress,
	getMarketAddress,
	watch,
	waitForEvent
} from '../test-lib/utils'
import {MetricsInstance, MarketInstance} from '../../types/truffle-contracts'
const uri = 'ws://localhost:7545'

contract('Allocator', ([deployer]) => {
	const addressConfigContract = artifacts.require('AddressConfig')
	const allocatorContract = artifacts.require('Allocator')
	const decimalsLibrary = artifacts.require('Decimals')
	const init = async (): Promise<[
		DevProtocolInstance,
		MarketInstance,
		MetricsInstance
	]> => {
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
			dev.generatePolicyFactory(),
			dev.generatePolicyGroup(),
			dev.generatePolicySet(),
			dev.generateDev()
		])
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		const policy = await artifacts.require('PolicyTestForAllocator').new()

		await dev.policyFactory.create(policy.address)
		const propertyAddress = getPropertyAddress(
			await dev.propertyFactory.create('test', 'TEST', deployer)
		)
		const [property] = await Promise.all([
			artifacts.require('Property').at(propertyAddress)
		])
		const marketBehavior = await artifacts
			.require('MarketTest1')
			.new(dev.addressConfig.address)
		const marketAddress = getMarketAddress(
			await dev.marketFactory.create(marketBehavior.address)
		)
		const [market] = await Promise.all([
			artifacts.require('Market').at(marketAddress)
		])
		await market.authenticate(property.address, '', '', '', '', '')
		const metricsAddress = await new Promise<string>(resolve => {
			market.authenticate(property.address, '', '', '', '', '')
			watch(dev.metricsFactory, uri)('Create', (_, values) =>
				resolve(values._metrics)
			)
		})
		const [metrics] = await Promise.all([
			artifacts.require('Metrics').at(metricsAddress)
		])
		return [dev, market, metrics]
	}

	describe('Allocator; allocate', () => {
		it("Calls Market Contract's calculate function mapped to Metrics Contract", async () => {
			const [dev, market, metrics] = await init()
			const behavior = await market.behavior()
			const [marketBehavior] = await Promise.all([
				artifacts.require('MarketTest1').at(behavior)
			])
			dev.allocator.allocate(metrics.address)
			await waitForEvent(marketBehavior, uri)('LogCalculate')
			expect(1).to.be.eq(1)
		})

		it('Should fail to call when other than Metrics address is passed')

		it(
			'Should fail to call when the Metrics linked Property is the target of the abstention penalty'
		)

		describe('Allocator; Arguments to pass to calculate', () => {
			it('The first argument is the address of Metrics Contract')

			it('The second argument is last run block number')

			it(
				'The second argument is the block number of the end of the abstention penalty if the Metrics linked Property was the targeted of the abstention penalty'
			)

			it('The third argument is current block number')
		})

		it('Return ETH to the sender when sent it')
	})

	describe('Allocator; allocation', () => {
		it(`
			last allocation block is 5760,
			mint per block is 50000,
			calculated asset value per block is 300,
			Market's total asset value per block is 7406907,
			number of assets per Market is 48568,
			number of assets total all Market is 547568;
			the result is ${5760 *
				50000 *
				(300 / 7406907) *
				(48568 / 547568)}`, async () => {
			const addressConfig = await addressConfigContract.new({from: deployer})
			const decimals = await decimalsLibrary.new({from: deployer})
			await allocatorContract.link('Decimals', decimals.address)
			const allocator = await allocatorContract.new(addressConfig.address, {
				from: deployer
			})
			const result = await allocator.allocation(
				5760,
				50000,
				300,
				7406907,
				48568,
				547568
			)
			expect(result.toNumber()).to.be.equal(
				~~(5760 * 50000 * (300 / 7406907) * (48568 / 547568))
			)
		})
	})

	describe('Allocator; calculatedCallback', () => {
		it(`
			last allocation block is 5760,
			mint per block is 50000,
			calculated asset value per block is 300,
			Market's total asset value per block is 7406907,
			number of assets per Market is 48568,
			number of assets total all Market is 547568;
			the incremented result is ${5760 * 50000 * (300 / 7406907) * (48568 / 547568)}`)

		it(
			'When after increment, update the value of `lastAssetValueEachMarketPerBlock`'
		)

		it(
			'Should fail to call the function when sent from other than Behavior Contract mapped to Metrics Contract'
		)

		it(
			'Should fail to call the function when it does not call in advance `allocate` function'
		)
	})

	describe('Allocator; withdraw', () => {
		describe('Allocator; Withdraw is mint', () => {
			it('Withdraw mints an ERC20 token specified in the State Contract')
		})

		describe('Allocator; Withdrawable amount', () => {
			it(
				'The withdrawable amount each holder is the number multiplied the balance of the price per Property Contract and the Property Contract of the sender'
			)

			it(
				'The withdrawal amount is always the full amount of the withdrawable amount'
			)

			it('When the withdrawable amount is 0, the withdrawal amount is 0')
		})

		describe('Allocator; Alice has sent 800 out of 1000 tokens to Bob. Bob has increased from 200 tokens to 1000 tokens. Price is 100', () => {
			describe('Allocator; Before increment', () => {
				it(`Alice's withdrawable amount is ${1000 * 100}`)

				it(`Bob's withdrawable amount is ${200 * 100}`)
			})

			describe('Allocator; After increment; New price is 120', () => {
				it(`Alice's withdrawable amount is ${1000 * 100 + 200 * 120}`)

				it(`Bob's withdrawable amount is ${200 * 100 + 1000 * 120}`)
			})

			it(
				'Should fail to call `beforeBalanceChange` when sent from other than Property Contract address'
			)
		})
	})

	describe('Allocator; kill', () => {
		it('Destruct this contract')

		it(
			'Should fail to destruct this contract when sent from the non-owner account'
		)
	})
})
