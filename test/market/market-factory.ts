import {DevProtocolInstance, UserInstance} from '../test-lib/instance'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
	getMarketAddress,
	DEFAULT_ADDRESS
} from '../test-lib/utils'

contract('MarketFactoryTest', ([deployer, user, dummyProperty]) => {
	const dev = new DevProtocolInstance(deployer)
	const userInstance = new UserInstance(dev, user)
	const marketContract = artifacts.require('Market')
	describe('MarketFactory; create', () => {
		let marketAddress: string
		let marketBehaviorAddress: string
		before(async () => {
			await dev.generateAddressConfig()
			await dev.generatePolicyGroup()
			await dev.generatePolicySet()
			await dev.generatePolicyFactory()
			await dev.generateVoteTimes()
			await dev.generateVoteTimesStorage()
			await dev.generateMarketFactory()
			await dev.generateMarketGroup()
			const policy = await userInstance.getPolicy('PolicyTest1')
			await dev.policyFactory.create(policy.address, {from: user})
			const market = await userInstance.getMarket('MarketTest1')
			marketBehaviorAddress = market.address
			const result = await dev.marketFactory.create(market.address, {
				from: user
			})
			marketAddress = getMarketAddress(result)
		})

		it('Create a new market contract and emit create event telling created market address,', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedMarket = await marketContract.at(marketAddress)
			const behaviorAddress = await deployedMarket.behavior({from: deployer})
			expect(behaviorAddress).to.be.equal(marketBehaviorAddress)
		})

		it('Adds a new Market Contract address to State Contract,', async () => {
			const result = await dev.marketGroup.isGroup(marketAddress, {
				from: deployer
			})
			expect(result).to.be.equal(true)
		})

		it('A freshly created market is not enabled,', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedMarket = await marketContract.at(marketAddress)
			expect(await deployedMarket.enabled()).to.be.equal(false)
		})
		it('The maximum number of votes is incremented.', async () => {
			let times = await dev.voteTimes.getAbstentionTimes(dummyProperty)
			expect(times.toNumber()).to.be.equal(1)
			const market = await userInstance.getMarket('MarketTest2')
			await dev.marketFactory.create(market.address, {
				from: user
			})
			times = await dev.voteTimes.getAbstentionTimes(dummyProperty)
			expect(times.toNumber()).to.be.equal(2)
		})
		it('An error occurs if the default address is specified.', async () => {
			const result = await dev.marketFactory
				.create(DEFAULT_ADDRESS, {
					from: user
				})
				.catch((err: Error) => err)
			validateAddressErrorMessage(result as Error)
		})
		it('Pause and release of pause can only be executed by deployer.', async () => {
			let result = await dev.marketFactory
				.pause({from: user})
				.catch((err: Error) => err)
			validateErrorMessage(
				result as Error,
				'PauserRole: caller does not have the Pauser role'
			)
			await dev.marketFactory.pause({from: deployer})
			result = await dev.marketFactory
				.unpause({from: user})
				.catch((err: Error) => err)
			validateErrorMessage(
				result as Error,
				'PauserRole: caller does not have the Pauser role'
			)
			await dev.marketFactory.unpause({from: deployer})
		})
		it('Cannot run if paused.', async () => {
			await dev.marketFactory.pause({from: deployer})
			const market = await userInstance.getMarket('MarketTest3')
			const result = await dev.marketFactory
				.create(market.address, {
					from: user
				})
				.catch((err: Error) => err)
			validateErrorMessage(result as Error, 'You cannot use that')
		})
		it('Can be executed when pause is released', async () => {
			await dev.marketFactory.unpause({from: deployer})
			const market = await userInstance.getMarket('MarketTest3')
			let createResult = await dev.marketFactory.create(market.address, {
				from: user
			})
			const tmpMarketAddress = getMarketAddress(createResult)
			const result = await dev.marketGroup.isGroup(tmpMarketAddress, {
				from: deployer
			})
			expect(result).to.be.equal(true)
		})
	})
})
