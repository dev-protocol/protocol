import { DevProtocolInstance } from '../test-lib/instance'
import { getMarketAddress } from '../test-lib/utils/log'
import { validateAddressErrorMessage } from '../test-lib/utils/error'
import { DEFAULT_ADDRESS } from '../test-lib/const'

contract('MarketFactoryTest', ([deployer, user]) => {
	const dev = new DevProtocolInstance(deployer)
	const marketContract = artifacts.require('Market')
	describe('MarketFactory; create', () => {
		let marketAddress: string
		let marketBehaviorAddress: string
		before(async () => {
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
			marketBehaviorAddress = market.address
			const result = await dev.marketFactory.create(market.address, {
				from: user,
			})
			marketAddress = getMarketAddress(result)
		})

		it('Create a new market contract and emit create event telling created market address,', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedMarket = await marketContract.at(marketAddress)
			const behaviorAddress = await deployedMarket.behavior({ from: deployer })
			expect(behaviorAddress).to.be.equal(marketBehaviorAddress)
		})

		it('Adds a new Market Contract address to State Contract,', async () => {
			const result = await dev.marketGroup.isGroup(marketAddress, {
				from: deployer,
			})
			expect(result).to.be.equal(true)
		})

		it('A freshly created market is enabled,', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedMarket = await marketContract.at(marketAddress)
			expect(await deployedMarket.enabled()).to.be.equal(true)
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
})
