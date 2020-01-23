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

			it(
				'Total value of votes for and against, votes are the number of sent DEVs'
			)
			it(
				'Creating a market contract from other than a factory results in an error'
			)

			it('When total votes for more than 10% of the total supply of DEV are obtained, this Market Contract is enabled', async () => {
				// eslint-disable-next-line no-warning-comments
				// TODO PolicyTest1, VoteCounter, VoteCounterStorage
				// await dummyDEV.approve(lockup.address, 10000, {from: deployer})
				// await lockup.lockup(propertyAddress, 10000, {from: deployer})
				// await market.vote(propertyAddress, true, {from: deployer})
				// const isEnable = await market.enabled({from: deployer})
				// expect(isEnable).to.be.equal(true)
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

			it('Vote decrease the number of sent DEVs from voter owned DEVs', async () => {
				// Await dummyDEV.approve(market.address, 100, {from: deployer})
				// await market.vote(100, {from: deployer})
				// const ownedDEVs = await dummyDEV.balanceOf(deployer, {from: deployer})
				// expect(ownedDEVs.toNumber()).to.be.equal(9900)
			})

			it('Vote decrease the number of sent DEVs from DEVtoken totalSupply', async () => {
				// Await dummyDEV.approve(market.address, 100, {from: deployer})
				// await market.vote(100, {from: deployer})
				// const DEVsTotalSupply = await dummyDEV.totalSupply({from: deployer})
				// expect(DEVsTotalSupply.toNumber()).to.be.equal(9900)
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
		})
	}
)
