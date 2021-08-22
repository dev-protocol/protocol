import { DevProtocolInstance } from '../test-lib/instance'
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
		interface Log {
			event: string
			args: {
				_from: string
				_market: string
			}
		}

		let marketAddress = ''
		const logs: Log[] = await dev.marketFactory
			.create(market.address, {
				from: user,
			})
			.then((res) => {
				marketAddress = getMarketAddress(res)
				return res.logs as Log[]
			})

		const eventFrom = logs.filter((log) => log.event === 'Create')[0].args._from
		const eventMarket = logs.filter((log) => log.event === 'Create')[0].args
			._market
		return [dev, marketAddress, marketBehaviorAddress, [eventFrom, eventMarket]]
	}

	describe('MarketFactory; create', () => {
		it('Create a new market contract and emit create event telling created market address,', async () => {
			const [, market, marketBehavior] = await init()
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedMarket = await marketContract.at(market)
			const behaviorAddress = await deployedMarket.behavior({ from: deployer })
			expect(behaviorAddress).to.be.equal(marketBehavior)
		})
		it('Adds a new Market Contract address to State Contract,', async () => {
			const [dev, market] = await init()
			const result = await dev.marketGroup.isGroup(market, {
				from: deployer,
			})
			expect(result).to.be.equal(true)
		})
		it('A freshly created market is enabled,', async () => {
			const [, market] = await init()
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedMarket = await marketContract.at(market)
			expect(await deployedMarket.enabled()).to.be.equal(true)
		})
		it('A secoundly created market is not enabled,', async () => {
			const [, market] = await init()
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedMarket = await marketContract.at(market)
			expect(await deployedMarket.enabled()).to.be.equal(true)
		})
		it('generate create event', async () => {
			const [, market, , [fromAddress, marketAddress]] = await init()
			expect(fromAddress).to.be.equal(user)
			expect(marketAddress).to.be.equal(market)
		})
		it('The second and subsequent markets will not be automatically enabled.', async () => {
			const [dev] = await init()
			const secoundMarket = await dev.getMarket('MarketTest1', user)
			const secoundMarketAddress = getMarketAddress(
				await dev.marketFactory.create(secoundMarket.address, {
					from: user,
				})
			)
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedMarket = await marketContract.at(secoundMarketAddress)
			expect(await deployedMarket.enabled()).to.be.equal(false)
		})
		it('An error occurs if the default address is specified.', async () => {
			const [dev] = await init()
			await dev.marketFactory
				.create(DEFAULT_ADDRESS, {
					from: user,
				})
				.catch((err: Error) => {
					validateAddressErrorMessage(err)
				})
		})
	})

	describe('MarketFactory; enable', () => {
		describe('failed', () => {
			it('Cannot be executed by anyone but the owner.', async () => {
				const dev = new DevProtocolInstance(deployer)
				await dev.generateAddressConfig()
				await dev.generateMarketFactory()
				await dev.marketFactory
					.enable(DEFAULT_ADDRESS, {
						from: user,
					})
					.catch((err: Error) => {
						validateErrorMessage(err, 'caller is not the owner', false)
					})
			})
			it('Only the market address can be specified.', async () => {
				const dev = new DevProtocolInstance(deployer)
				await dev.generateAddressConfig()
				await dev.generateMarketGroup()
				await dev.generateMarketFactory()
				await dev.marketFactory
					.enable(dummyMarketAddress)
					.catch((err: Error) => {
						validateAddressErrorMessage(err)
					})
			})
			it('we cannot specify the address of an active market.', async () => {
				const [dev, market] = await init()
				await dev.marketFactory.enable(market).catch((err: Error) => {
					validateErrorMessage(err, 'already enabled')
				})
			})
		})
		describe('success', () => {
			it('Enabling the Market', async () => {
				const [dev] = await init()
				const secoundMarket = await dev.getMarket('MarketTest1', user)
				const secoundMarketAddress = getMarketAddress(
					await dev.marketFactory.create(secoundMarket.address, {
						from: user,
					})
				)
				await dev.marketFactory.enable(secoundMarketAddress)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const deployedMarket = await marketContract.at(secoundMarketAddress)
				expect(await deployedMarket.enabled()).to.be.equal(true)
			})
		})
	})
})
