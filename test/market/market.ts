import {DevProtocolInstance, UserInstance} from '../test-lib/instance'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
	waitForEvent,
	getMarketAddress,
	getPropertyAddress,
	WEB3_URI,
	mine
} from '../test-lib/utils'

contract(
	'MarketTest',
	([
		deployer,
		marketFactory,
		behavuor,
		user,
		metrics,
		allocator,
		propertyAuther
	]) => {
		const marketContract = artifacts.require('Market')
		describe('Market; constructor', () => {
			const dev = new DevProtocolInstance(deployer)
			const userInstance = new UserInstance(dev, user)
			beforeEach(async () => {
				await dev.generateAddressConfig()
			})
			it('market factory以外からは作成できない', async () => {
				await dev.addressConfig.setMarketFactory(marketFactory)
				const result = await marketContract
					.new(dev.addressConfig.address, behavuor, {from: deployer})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result as Error)
			})
			it('各プロパティがセットされている', async () => {
				await Promise.all([
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
					dev.generatePolicySet()
				])
				await dev.addressConfig.setMarketFactory(marketFactory)
				const iPolicyInstance = await userInstance.getPolicy('PolicyTest1')
				await dev.policyFactory.create(iPolicyInstance.address)
				const market = await marketContract.new(
					dev.addressConfig.address,
					behavuor,
					{from: marketFactory}
				)
				expect(await market.behavior()).to.be.equal(behavuor)
				expect(await market.enabled()).to.be.equal(false)
			})
		})
		describe('Market; schema', () => {
			const dev = new DevProtocolInstance(deployer)
			const userInstance = new UserInstance(dev, user)
			it('Get Schema of mapped Behavior Contract', async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
					dev.generatePolicySet()
				])
				await dev.addressConfig.setMarketFactory(marketFactory)
				const iPolicyInstance = await userInstance.getPolicy('PolicyTest1')
				await dev.policyFactory.create(iPolicyInstance.address)
				const behavuor = await userInstance.getMarket('MarketTest1')
				const market = await marketContract.new(
					dev.addressConfig.address,
					behavuor.address,
					{from: marketFactory}
				)
				expect(await market.schema()).to.be.equal('[]')
			})
		})
		describe('Market; calculate', () => {
			const dev = new DevProtocolInstance(deployer)
			const userInstance = new UserInstance(dev, user)
			it('Proxy to mapped Behavior Contract', async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
					dev.generatePolicySet()
				])
				await dev.addressConfig.setMarketFactory(marketFactory)
				const iPolicyInstance = await userInstance.getPolicy('PolicyTest1')
				await dev.policyFactory.create(iPolicyInstance.address)
				const behavuor = await userInstance.getMarket('MarketTest3')
				const market = await marketContract.new(
					dev.addressConfig.address,
					behavuor.address,
					{from: marketFactory}
				)
				await dev.addressConfig.setAllocator(allocator)
				await market.calculate(metrics, 0, 100, {
					from: allocator
				})
				await waitForEvent(behavuor, WEB3_URI)('LogCalculate')
			})
		})
		describe('Market; authenticate', () => {
			it('Proxy to mapped Behavior Contract')

			it(
				'Should fail to run when sent from other than the owner of Property Contract'
			)

			it(
				'Should fail to the transaction if the second argument as ID and a Metrics Contract exists with the same ID.'
			)
		})

		describe('Market; authenticatedCallback', () => {
			it('Create a new Metrics Contract')

			it(
				'Market Contract address and Property Contract address are mapped to the created Metrics Contract'
			)

			it(
				'Should fail to create a new Metrics Contract when sent from non-Behavior Contract'
			)
		})

		describe('Market; vote', () => {
			const dev = new DevProtocolInstance(deployer)
			const userInstance = new UserInstance(dev, user)
			let marketAddress: string
			let propertyAddress: string
			const iPolicyContract = artifacts.require('IPolicy')
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generateMarketFactory(),
					dev.generateMarketGroup(),
					dev.generateVoteTimes(),
					dev.generateVoteTimesStorage(),
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
					dev.generatePolicySet(),
					dev.generateVoteCounter(),
					dev.generateVoteCounterStorage(),
					dev.generatePropertyFactory(),
					dev.generatePropertyGroup(),
					dev.generateLockup(),
					dev.generateLockupStorage(),
					dev.generateDev()
				])
				const iPolicyInstance = await userInstance.getPolicy('PolicyTest1')
				await dev.policyFactory.create(iPolicyInstance.address)
				const createMarketResult = await dev.marketFactory.create(behavuor)
				marketAddress = getMarketAddress(createMarketResult)
				const createPropertyResult = await dev.propertyFactory.create(
					'test',
					'TEST',
					propertyAuther
				)
				propertyAddress = getPropertyAddress(createPropertyResult)
				await dev.dev.mint(user, 10000, {from: deployer})
			})

			it('An error occurs if anything other than property address is specified', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress)
				const result = await marketInstance
					.vote(deployer, true, {from: user})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result as Error)
			})
			it('voting deadline is over', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const iPolicyInstance = await iPolicyContract.at(
					await dev.addressConfig.policy()
				)
				const marketVotingBlocks = await iPolicyInstance.marketVotingBlocks()
				await mine(marketVotingBlocks.toNumber())
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress)
				const result = await marketInstance
					.vote(propertyAddress, true)
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'voting deadline is over')
			})
			it('Should fail to vote when already determined enabled', async () => {
				await dev.dev.deposit(propertyAddress, 10000, {from: user})
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress)
				await marketInstance.vote(propertyAddress, true, {from: user})
				expect(await marketInstance.enabled()).to.be.equal(true)
				const result = await marketInstance
					.vote(propertyAddress, true, {from: user})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'market is already enabled')
			})

			it('If you specify true, it becomes a valid vote.', async () => {
				await dev.dev.deposit(propertyAddress, 10000, {from: user})
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress)
				await marketInstance.vote(propertyAddress, true, {from: user})
				const agreeCount = await dev.voteCounter.getAgreeCount(marketAddress)
				const oppositeCount = await dev.voteCounter.getOppositeCount(
					marketAddress
				)
				expect(agreeCount.toNumber()).to.be.equal(10000)
				expect(oppositeCount.toNumber()).to.be.equal(0)
			})

			it('If false is specified, it becomes an invalid vote.', async () => {
				await dev.dev.deposit(propertyAddress, 10000, {from: user})
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress)
				await marketInstance.vote(propertyAddress, false, {from: user})
				const agreeCount = await dev.voteCounter.getAgreeCount(marketAddress)
				const oppositeCount = await dev.voteCounter.getOppositeCount(
					marketAddress
				)
				expect(agreeCount.toNumber()).to.be.equal(0)
				expect(oppositeCount.toNumber()).to.be.equal(10000)
			})

			it('If the number of valid votes is not enough, it remains invalid.', async () => {
				await dev.dev.deposit(propertyAddress, 9000, {from: user})
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress)
				await marketInstance.vote(propertyAddress, true, {from: user})
				expect(await marketInstance.enabled()).to.be.equal(false)
			})
			it('Becomes valid when the number of valid votes exceeds the specified number.', async () => {
				await dev.dev.deposit(propertyAddress, 10000, {from: user})
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress)
				await marketInstance.vote(propertyAddress, true, {from: user})
				expect(await marketInstance.enabled()).to.be.equal(true)
			})
		})
	}
)
