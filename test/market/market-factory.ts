import {DevProtocolInstance} from '../test-lib/instance'
import {getMarketAddress} from '../test-lib/utils/log'
import {getAbstentionTimes} from '../test-lib/utils/common'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
} from '../test-lib/utils/error'
import {DEFAULT_ADDRESS} from '../test-lib/const'

contract('MarketFactoryTest', ([deployer, user, dummyProperty]) => {
	const dev = new DevProtocolInstance(deployer)
	const marketContract = artifacts.require('Market')
	describe('MarketFactory; create', () => {
		let marketAddress: string
		let marketBehaviorAddress: string
		before(async () => {
			await dev.generateAddressConfig()
			await Promise.all([
				dev.generatePolicyGroup(),
				dev.generatePolicySet(),
				dev.generatePolicyFactory(),
				dev.generateVoteTimes(),
				dev.generateVoteTimesStorage(),
				dev.generateMarketFactory(),
				dev.generateMarketGroup(),
			])
			const policy = await dev.getPolicy('PolicyTest1', user)
			await dev.policyFactory.create(policy.address, {from: user})
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
			const behaviorAddress = await deployedMarket.behavior({from: deployer})
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
		it('The maximum number of votes is incremented.', async () => {
			let sub = await getAbstentionTimes(dev, dummyProperty)
			expect(sub).to.be.equal(1)
			const market = await dev.getMarket('MarketTest2', user)
			const result = await dev.marketFactory.create(market.address, {
				from: user,
			})
			sub = await getAbstentionTimes(dev, dummyProperty)
			expect(sub).to.be.equal(2)
			const tmpMarketAddress = getMarketAddress(result)
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedMarket = await marketContract.at(tmpMarketAddress)
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
		it('Pause and release of pause can only be executed by deployer.', async () => {
			let result = await dev.marketFactory
				.pause({from: user})
				.catch((err: Error) => err)
			validateErrorMessage(
				result,
				'PauserRole: caller does not have the Pauser role'
			)
			await dev.marketFactory.pause({from: deployer})
			result = await dev.marketFactory
				.unpause({from: user})
				.catch((err: Error) => err)
			validateErrorMessage(
				result,
				'PauserRole: caller does not have the Pauser role'
			)
			await dev.marketFactory.unpause({from: deployer})
		})
		it('Cannot run if paused.', async () => {
			await dev.marketFactory.pause({from: deployer})
			const market = await dev.getMarket('MarketTest3', user)
			const result = await dev.marketFactory
				.create(market.address, {
					from: user,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'You cannot use that')
		})
		it('Can be executed when pause is released', async () => {
			await dev.marketFactory.unpause({from: deployer})
			const market = await dev.getMarket('MarketTest3', user)
			let createResult = await dev.marketFactory.create(market.address, {
				from: user,
			})
			const tmpMarketAddress = getMarketAddress(createResult)
			const result = await dev.marketGroup.isGroup(tmpMarketAddress, {
				from: deployer,
			})
			expect(result).to.be.equal(true)
		})
	})
})
