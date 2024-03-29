import { DevProtocolInstance } from '../test-lib/instance'
import {
	takeSnapshot,
	revertToSnapshot,
	Snapshot,
} from '../test-lib/utils/snapshot'
import { getMarketAddress } from '../test-lib/utils/log'
import {
	validateAddressErrorMessage,
	validateErrorMessage,
} from '../test-lib/utils/error'
import { DEFAULT_ADDRESS } from '../test-lib/const'

contract('MarketFactoryTest', ([deployer, user, dummyMarketAddress]) => {
	const marketContract = artifacts.require('Market')
	const init = async (): Promise<
		[DevProtocolInstance, string, string, [string, string]]
	> => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await Promise.all([
			dev.generatePolicyGroup(),
			dev.generatePolicyFactory(),
			dev.generateMarketFactory(),
			dev.generateMarketGroup(),
		])
		const policy = await dev.getPolicy('PolicyTest1', user)
		await dev.policyFactory.create(policy.address, { from: user })
		const market = await dev.getMarket('MarketTest1', user)
		const marketBehaviorAddress = market.address
		const result = await dev.marketFactory.create(market.address, {
			from: user,
		})
		const eventFrom = result.logs.filter((log) => log.event === 'Create')[0]
			.args._from as string
		const eventMarket = result.logs.filter((log) => log.event === 'Create')[0]
			.args._market as string
		const marketAddress = getMarketAddress(result)
		return [dev, marketAddress, marketBehaviorAddress, [eventFrom, eventMarket]]
	}

	let dev: DevProtocolInstance
	let market: string
	let marketBehavior: string
	let fromAddress: string
	let marketAddress: string
	let snapshot: Snapshot
	let snapshotId: string

	before(async () => {
		;[dev, market, marketBehavior, [fromAddress, marketAddress]] = await init()
	})

	beforeEach(async () => {
		snapshot = (await takeSnapshot()) as Snapshot
		snapshotId = snapshot.result
	})

	afterEach(async () => {
		await revertToSnapshot(snapshotId)
	})

	describe('MarketFactory; create', () => {
		it('Create a new market contract and emit create event telling created market address,', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedMarket = await marketContract.at(market)
			const behaviorAddress = await deployedMarket.behavior({ from: deployer })
			expect(behaviorAddress).to.be.equal(marketBehavior)
		})
		it('Adds a new Market Contract address to State Contract,', async () => {
			const result = await dev.marketGroup.isGroup(market, {
				from: deployer,
			})
			expect(result).to.be.equal(true)
		})
		it('A freshly created market is enabled,', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedMarket = await marketContract.at(market)
			expect(await deployedMarket.enabled()).to.be.equal(true)
		})
		it('A secoundly created market is not enabled,', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedMarket = await marketContract.at(market)
			expect(await deployedMarket.enabled()).to.be.equal(true)
		})
		it('generate create event', async () => {
			expect(fromAddress).to.be.equal(user)
			expect(marketAddress).to.be.equal(market)
		})
		it('The second and subsequent markets will not be automatically enabled.', async () => {
			const secoundMarket = await dev.getMarket('MarketTest1', user)
			const result = await dev.marketFactory.create(secoundMarket.address, {
				from: user,
			})
			const secoundMarketAddress = getMarketAddress(result)
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedMarket = await marketContract.at(secoundMarketAddress)
			expect(await deployedMarket.enabled()).to.be.equal(false)
		})
		it('An error occurs if the default address is specified.', async () => {
			const result = await dev.marketFactory
				.create(DEFAULT_ADDRESS, {
					from: user,
				})
				.catch((err: Error) => err)
			validateAddressErrorMessage(result)
		})
	})

	describe('MarketFactory; enable', () => {
		describe('failed', () => {
			it('Cannot be executed by anyone but the owner.', async () => {
				const dev = new DevProtocolInstance(deployer)
				await dev.generateAddressConfig()
				await dev.generateMarketFactory()
				const res = await dev.marketFactory
					.enable(DEFAULT_ADDRESS, {
						from: user,
					})
					.catch((err: Error) => err)
				validateErrorMessage(res, 'caller is not the owner', false)
			})
			it('Only the market address can be specified.', async () => {
				const dev = new DevProtocolInstance(deployer)
				await dev.generateAddressConfig()
				await dev.generateMarketGroup()
				await dev.generateMarketFactory()
				const res = await dev.marketFactory
					.enable(dummyMarketAddress)
					.catch((err: Error) => err)
				validateErrorMessage(res, 'illegal address')
			})
			it('we cannot specify the address of an active market.', async () => {
				const [dev, market] = await init()
				const res = await dev.marketFactory
					.enable(market)
					.catch((err: Error) => err)
				validateErrorMessage(res, 'already enabled')
			})
		})
		describe('success', () => {
			it('Enabling the Market', async () => {
				const secoundMarket = await dev.getMarket('MarketTest1', user)
				const result = await dev.marketFactory.create(secoundMarket.address, {
					from: user,
				})
				const secoundMarketAddress = getMarketAddress(result)
				await dev.marketFactory.enable(secoundMarketAddress)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const deployedMarket = await marketContract.at(secoundMarketAddress)
				expect(await deployedMarket.enabled()).to.be.equal(true)
			})
		})
	})
	describe('MarketFactory; disable', () => {
		describe('failed', () => {
			it('Cannot be executed by anyone but the owner.', async () => {
				const dev = new DevProtocolInstance(deployer)
				await dev.generateAddressConfig()
				await dev.generateMarketFactory()
				const res = await dev.marketFactory
					.disable(DEFAULT_ADDRESS, {
						from: user,
					})
					.catch((err: Error) => err)
				validateErrorMessage(res, 'caller is not the owner', false)
			})
			it('Only the market address can be specified.', async () => {
				const dev = new DevProtocolInstance(deployer)
				await dev.generateAddressConfig()
				await dev.generateMarketGroup()
				await dev.generateMarketFactory()
				const res = await dev.marketFactory
					.disable(dummyMarketAddress)
					.catch((err: Error) => err)
				validateErrorMessage(res, 'illegal address')
			})
			it('we cannot specify the address of an active market.', async () => {
				const market = await dev.getMarket('MarketTest1', user)
				const result = await dev.marketFactory.create(market.address, {
					from: user,
				})
				const marketAddress = getMarketAddress(result)
				const res = await dev.marketFactory
					.disable(marketAddress)
					.catch((err: Error) => err)
				validateErrorMessage(res, 'already disabled')
			})
			it('we cannot reenable the market', async () => {
				await dev.marketFactory.disable(marketAddress)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const deployedMarket = await marketContract.at(marketAddress)
				expect(await deployedMarket.enabled()).to.be.equal(false)
				const res = await dev.marketFactory
					.enable(marketAddress)
					.catch((err: Error) => err)
				validateErrorMessage(res, 'illegal address')
			})
		})
		describe('success', () => {
			it('disabling the Market', async () => {
				await dev.marketFactory.disable(marketAddress)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const deployedMarket = await marketContract.at(marketAddress)
				expect(await deployedMarket.enabled()).to.be.equal(false)
			})
		})
	})
})
