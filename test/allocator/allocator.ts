import {DevProtocolInstance} from '../test-lib/instance'
import BigNumber from 'bignumber.js'
import {toBigNumber, mine} from '../test-lib/utils/common'
import {getPropertyAddress, getMarketAddress} from '../test-lib/utils/log'
import {watch, waitForEvent, getEventValue} from '../test-lib/utils/event'
import {
	validateErrorMessage,
	validatePauseErrorMessage,
	validatePauseOnlyOwnerErrorMessage,
} from '../test-lib/utils/error'

import {WEB3_URI} from '../test-lib/const'
import {
	MetricsInstance,
	MarketInstance,
	MarketTest1Instance,
	AddressConfigInstance,
	IPolicyInstance,
} from '../../types/truffle-contracts'

contract('Allocator', ([deployer, user1]) => {
	const init = async (): Promise<
		[DevProtocolInstance, MarketInstance, MetricsInstance]
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
		const policy = await artifacts.require('PolicyTestForAllocator').new()

		await dev.policyFactory.create(policy.address)
		const propertyAddress = getPropertyAddress(
			await dev.propertyFactory.create('test', 'TEST', deployer)
		)
		const [property] = await Promise.all([
			artifacts.require('Property').at(propertyAddress),
		])
		const marketBehavior = await artifacts
			.require('MarketTest1')
			.new(dev.addressConfig.address)
		const marketAddress = getMarketAddress(
			await dev.marketFactory.create(marketBehavior.address)
		)
		const [market] = await Promise.all([
			artifacts.require('Market').at(marketAddress),
		])
		await market.authenticate(property.address, 'id1', '', '', '', '')
		const metricsAddress = await new Promise<string>((resolve) => {
			watch(dev.metricsFactory, WEB3_URI)('Create', (_, values) =>
				resolve(values._metrics)
			)
		})
		const [metrics] = await Promise.all([
			artifacts.require('Metrics').at(metricsAddress),
		])
		return [dev, market, metrics]
	}

	const err = (error: Error): Error => error
	const getMarketBehavior = async (
		market: MarketInstance
	): Promise<MarketTest1Instance> => {
		const behavior = await market.behavior()
		const [marketBehavior] = await Promise.all([
			artifacts.require('MarketTest1').at(behavior),
		])
		return marketBehavior
	}

	const getPolicy = async (
		addressConfig: AddressConfigInstance
	): Promise<IPolicyInstance> => {
		const policyAddress = await addressConfig.policy()
		const [policy] = await Promise.all([
			artifacts.require('IPolicy').at(policyAddress),
		])
		return policy
	}

	describe('Allocator; allocate', () => {
		it("Calls Market Contract's calculate function mapped to Metrics Contract", async () => {
			const [dev, market, metrics] = await init()
			const behavior = await getMarketBehavior(market)
			await dev.allocator.allocate(metrics.address)
			await waitForEvent(behavior, WEB3_URI)('LogCalculate')
			expect(1).to.be.eq(1)
		})

		it('Determine the calculation period by the interval between the previous run block and the current running block', async () => {
			const [dev, market, metrics] = await init()
			const behavior = await market
				.behavior()
				.then((x) => artifacts.require('MarketTest1').at(x))
			await dev.allocator.setWaitUntilAllocatable(5)
			await behavior.changeAsynchronousMode(true)
			await dev.allocator.allocate(metrics.address)
			await behavior.calculated()
			const _lastBlock = await dev.allocatorStorage
				.getLastBlockNumber(metrics.address)
				.then(toBigNumber)
			await mine(10)
			// eslint-disable-next-line no-undef
			const fromBlock = await web3.eth.getBlockNumber()
			await dev.allocator.allocate(metrics.address)
			await mine(10)
			await behavior.calculated()
			const blocks = await getEventValue(
				dev.allocator,
				WEB3_URI,
				fromBlock
			)('BeforeAllocation', '_blocks')
			const lastBlock = await dev.allocatorStorage
				.getLastBlockNumber(metrics.address)
				.then(toBigNumber)
			expect(blocks.toString()).to.be.equal('12')
			expect(lastBlock.minus(_lastBlock).toString()).to.be.equal(
				blocks.toString()
			)
		})

		it('Should fail to call when other than Metrics address is passed', async () => {
			const [dev] = await init()
			const res = await dev.allocator.allocate(dev.dev.address).catch(err)
			expect(res).to.be.instanceOf(Error)
		})

		it('Should fail to call when the Metrics linked Property is the target of the abstention penalty', async () => {
			const [dev, , metrics] = await init()
			const marketBehavior = await artifacts
				.require('MarketTest2')
				.new(dev.addressConfig.address)
			await dev.marketFactory.create(marketBehavior.address)
			const res = await dev.allocator.allocate(metrics.address).catch(err)
			validateErrorMessage(res, 'outside the target period')
		})

		describe('Allocator; Arguments to pass to calculate', () => {
			it('The first argument is the address of Metrics Contract', async () => {
				const [dev, market, metrics] = await init()
				const behavior = await getMarketBehavior(market)
				await dev.allocator.allocate(metrics.address)
				const res = await getEventValue(behavior, WEB3_URI)(
					'LogCalculate',
					'_metrics'
				)
				expect(res).to.be.equal(metrics.address)
			})

			it('The second argument is last run block number', async () => {
				const [dev, market, metrics] = await init()
				const behavior = await getMarketBehavior(market)
				await dev.allocator.allocate(metrics.address)
				// eslint-disable-next-line no-undef
				const fromBlock = await web3.eth.getBlockNumber()
				const waitUntilAllocatable = await dev.allocatorStorage.getWaitUntilAllocatable()
				const lastBlock = fromBlock - waitUntilAllocatable.toNumber()
				const res = await getEventValue(behavior, WEB3_URI)(
					'LogCalculate',
					'_lastBlock'
				)
				expect(res.toString()).to.be.equal(lastBlock.toString())
			})

			it('The second argument is the block number of the end of the abstention penalty if the Metrics linked Property was the targeted of the abstention penalty', async () => {
				const [dev, market, metrics] = await init()
				const behavior = await getMarketBehavior(market)
				await dev.allocator.allocate(metrics.address)
				const lastBlock = await dev.allocatorStorage.getLastBlockNumber(
					metrics.address
				)
				const m1 = await artifacts
					.require('MarketTest2')
					.new(dev.addressConfig.address)
				const m2 = await artifacts
					.require('MarketTest3')
					.new(dev.addressConfig.address)
				await dev.marketFactory.create(m1.address)
				await dev.marketFactory.create(m2.address)

				// Increase block number
				await Promise.all([
					dev.dev.mint(deployer, 1),
					dev.dev.mint(deployer, 1),
					dev.dev.mint(deployer, 1),
					dev.dev.mint(deployer, 1),
					dev.dev.mint(deployer, 1),
				])

				const expected = lastBlock.toNumber() + 2
				// eslint-disable-next-line no-undef
				const fromBlock = await web3.eth.getBlockNumber()
				await dev.allocator.allocate(metrics.address)
				watch(dev.allocator, WEB3_URI)('Log', (_, value) => console.log(value))
				const res = await getEventValue(
					behavior,
					WEB3_URI,
					fromBlock
				)('LogCalculate', '_lastBlock')
				expect(res.toString()).to.be.equal(expected.toString())
			})

			it('The third argument is current block number', async () => {
				const [dev, market, metrics] = await init()
				const behavior = await getMarketBehavior(market)
				const util = await artifacts.require('Util').new()
				const blockNumber = await util.blockNumber()
				const expected = new BigNumber(blockNumber.toString()).plus(1)
				await dev.allocator.allocate(metrics.address)
				const res = await getEventValue(behavior, WEB3_URI)(
					'LogCalculate',
					'_currentBlock'
				)
				expect(res.toString()).to.be.equal(expected.toString())
			})
		})
	})

	describe('Allocator; allocation', () => {
		it(`
			last allocation block is 5760,
			mint per block is 50000,
			calculated asset value per block is 300,
			Market's total asset value per block is 7406907,
			number of assets per Market is 48568,
			number of assets total all Market is 547568;
			the result is ${
				5760 * 50000 * (300 / 7406907) * (48568 / 547568)
			}`, async () => {
			const [dev] = await init()
			const result = await dev.allocator.allocation(
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
		it('store the result of allocation as RewardsAmount', async () => {
			const [dev, , metrics] = await init()
			const property = await metrics.property()

			await dev.allocator.allocate(metrics.address)
			const [
				_blocks,
				_mint,
				_value,
				_marketValue,
				_assets,
				_totalAssets,
			] = await new Promise<BigNumber[]>((resolve) => {
				watch(dev.allocator, WEB3_URI)('BeforeAllocation', (_, values) => {
					const {
						_blocks,
						_mint,
						_value,
						_marketValue,
						_assets,
						_totalAssets,
					} = values
					resolve([
						new BigNumber(_blocks),
						new BigNumber(_mint),
						new BigNumber(_value),
						new BigNumber(_marketValue),
						new BigNumber(_assets),
						new BigNumber(_totalAssets),
					])
				})
			})
			const [
				_metrics,
				_argValue,
				_market,
				_property,
				_lockupValue,
			] = await new Promise<any[]>((resolve) => {
				watch(dev.allocator, WEB3_URI)('AllocationResult', (_, values) => {
					const {
						_metrics,
						_value,
						_market,
						_property,
						_lockupValue,
						_result,
					} = values
					resolve([
						_metrics,
						new BigNumber(_value),
						_market,
						_property,
						new BigNumber(_lockupValue),
						new BigNumber(_result),
					])
				})
			})

			const result = await dev.withdraw.getRewardsAmount(property)
			expect(result.toString()).to.be.equal(
				_blocks
					.times(_mint)
					.times(_value.div(_marketValue))
					.times(_assets.div(_totalAssets))
					.integerValue()
					.toFixed()
			)
			expect(_metrics).to.be.equal(metrics.address)
			expect(_market).to.be.equal(await metrics.market())
			expect(_property).to.be.equal(property)
			expect(_argValue.toNumber()).to.be.equal(100)
			expect(_lockupValue.toNumber()).to.be.equal(
				(await dev.lockup.getPropertyValue(property)).toNumber()
			)
		})

		it('values passed to `allocation` is correct', async () => {
			const [dev, market, metrics] = await init()
			const policy = await getPolicy(dev.addressConfig)
			const totalAssets = await dev.metricsGroup
				.totalIssuedMetrics()
				.then(toBigNumber)
			const assets = await market.issuedMetrics().then(toBigNumber)
			const lockUpValue = await dev.lockup.getAllValue().then(toBigNumber)
			const [marketLastValue, metricsLastValue] = await Promise.all([
				dev.allocatorStorage
					.getLastAssetValueEachMarketPerBlock(market.address)
					.then(toBigNumber),
				dev.allocatorStorage
					.getLastAssetValueEachMetrics(metrics.address)
					.then(toBigNumber),
			])
			const assetValue = await policy
				.assetValue(100, lockUpValue)
				.then(toBigNumber)
			const mint = await policy
				.rewards(lockUpValue, totalAssets)
				.then(toBigNumber)
			const block = 1
			const value = assetValue
				.times(new BigNumber('1000000000000000000'))
				.div(block)
				.toString()
				.replace(/(.*)\..*/, '$1')
			const marketValue = marketLastValue
				.minus(metricsLastValue)
				.plus(new BigNumber(value))

			await dev.allocator.allocate(metrics.address)

			const [
				_blocks,
				_mint,
				_value,
				_marketValue,
				_assets,
				_totalAssets,
			] = await new Promise<BigNumber[]>((resolve) => {
				watch(dev.allocator, WEB3_URI)('BeforeAllocation', (_, values) => {
					const {
						_blocks,
						_mint,
						_value,
						_marketValue,
						_assets,
						_totalAssets,
					} = values
					resolve([
						new BigNumber(_blocks),
						new BigNumber(_mint),
						new BigNumber(_value),
						new BigNumber(_marketValue),
						new BigNumber(_assets),
						new BigNumber(_totalAssets),
					])
				})
			})
			const [
				_metrics,
				_argValue,
				_market,
				_property,
				_lockupValue,
			] = await new Promise<any[]>((resolve) => {
				watch(dev.allocator, WEB3_URI)('AllocationResult', (_, values) => {
					const {
						_metrics,
						_value,
						_market,
						_property,
						_lockupValue,
						_result,
					} = values
					resolve([
						_metrics,
						new BigNumber(_value),
						_market,
						_property,
						new BigNumber(_lockupValue),
						new BigNumber(_result),
					])
				})
			})

			expect(_blocks.toString()).to.be.equal(block.toString())
			expect(_mint.toString()).to.be.equal(mint.toString())
			expect(_value.toString()).to.be.equal(value)
			expect(_marketValue.toString()).to.be.equal(marketValue.toString())
			expect(_assets.toString()).to.be.equal(assets.toString())
			expect(_totalAssets.toString()).to.be.equal(totalAssets.toString())
			expect(_metrics).to.be.equal(metrics.address)
			expect(_argValue.toNumber()).to.be.equal(100)
			expect(_market).to.be.equal(await metrics.market())
			expect(_property).to.be.equal(await metrics.property())
			expect(_lockupValue.toNumber()).to.be.equal(
				(await dev.lockup.getPropertyValue(await metrics.property())).toNumber()
			)
		})

		it('When after increment, update the value of `lastAssetValueEachMarketPerBlock`', async () => {
			const [dev, market, metrics] = await init()
			const before = await dev.allocatorStorage
				.getLastAssetValueEachMarketPerBlock(market.address)
				.then(toBigNumber)

			await dev.allocator.allocate(metrics.address)

			const after = await dev.allocatorStorage
				.getLastAssetValueEachMarketPerBlock(market.address)
				.then(toBigNumber)

			expect(before.toString()).to.be.not.equal(after.toString())
		})

		it('Should fail to call the function when sent from other than Behavior Contract mapped to Metrics Contract', async () => {
			const [dev, , metrics] = await init()

			await dev.addressConfig.setMetricsFactory(deployer)
			await dev.metricsGroup.addGroup(deployer)

			const res = await dev.allocator
				.calculatedCallback(metrics.address, 9999)
				.catch((err: Error) => err)

			await dev.addressConfig.setMetricsFactory(dev.metricsFactory.address)
			validateErrorMessage(res, `don't call from other than market behavior`)
		})

		it('Should fail to call the function when it does not call in advance `allocate` function', async () => {
			const [dev, , metrics] = await init()
			const pending = await dev.allocatorStorage.getPendingIncrement(
				metrics.address
			)
			const res = await dev.allocator
				.calculatedCallback(metrics.address, 9999)
				.catch((err: Error) => err)

			expect(pending).to.be.equal(false)
			expect(res).to.be.an.instanceOf(Error)
		})
		it('dispatch events', async () => {
			const [dev, market, metrics] = await init()

			await dev.allocator.allocate(metrics.address)
			const [, , , , _assets, _totalAssets] = await new Promise<BigNumber[]>(
				(resolve) => {
					watch(dev.allocator, WEB3_URI)('BeforeAllocation', (_, values) => {
						const {
							_blocks,
							_mint,
							_value,
							_marketValue,
							_assets,
							_totalAssets,
						} = values
						resolve([
							new BigNumber(_blocks),
							new BigNumber(_mint),
							new BigNumber(_value),
							new BigNumber(_marketValue),
							new BigNumber(_assets),
							new BigNumber(_totalAssets),
						])
					})
				}
			)
			const [_metrics] = await new Promise<any[]>((resolve) => {
				watch(dev.allocator, WEB3_URI)('AllocationResult', (_, values) => {
					const {
						_metrics,
						_value,
						_market,
						_property,
						_lockupValue,
						_result,
					} = values
					resolve([
						_metrics,
						new BigNumber(_value),
						_market,
						_property,
						new BigNumber(_lockupValue),
						new BigNumber(_result),
					])
				})
			})

			const issuedMetrics = await market.issuedMetrics().then(toBigNumber)
			const totalIssuedMetrics = await dev.metricsGroup
				.totalIssuedMetrics()
				.then(toBigNumber)
			expect(_assets.toString()).to.be.equal(issuedMetrics.toString())
			expect(_totalAssets.toString()).to.be.equal(totalIssuedMetrics.toString())
			expect(_metrics).to.be.equal(metrics.address)
		})
	})

	describe('Allocator; pause', () => {
		it('pause and unpause this contract', async () => {
			const [dev, , metrics] = await init()
			await dev.allocator.pause()
			const res = await dev.allocator
				.allocate(metrics.address)
				.catch((err: Error) => err)
			validatePauseErrorMessage(res)
			await dev.allocator.unpause()
			await dev.allocator.allocate(metrics.address)
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
		it('can get whether allocate can run or not.', async () => {
			const [dev, , metrics] = await init()
			await dev.allocator.setWaitUntilAllocatable(3)
			let allocatable = await dev.allocator.allocatable(metrics.address)
			expect(allocatable).to.be.equal(true)
			await dev.allocator.allocate(metrics.address)
			allocatable = await dev.allocator.allocatable(metrics.address)
			expect(allocatable).to.be.equal(false)
			const res = await dev.allocator
				.allocate(metrics.address)
				.catch((err: Error) => err)
			validateErrorMessage(res, 'can not allocate yet')
			await mine(3)
			allocatable = await dev.allocator.allocatable(metrics.address)
			expect(allocatable).to.be.equal(true)
		})
		it('can set wait until allocatable valiable only owner.', async () => {
			const [dev, ,] = await init()
			const res = await dev.allocator
				.setWaitUntilAllocatable(3, {from: user1})
				.catch((err: Error) => err)
			validatePauseOnlyOwnerErrorMessage(res)
		})
	})
})
