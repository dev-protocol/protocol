import {DevProtocolInstance} from '../test-lib/instance'
import {MarketInstance} from '../../types/truffle-contracts'
import {mine} from '../test-lib/utils/common'
import {getPropertyAddress, getMarketAddress} from '../test-lib/utils/log'
import {watch} from '../test-lib/utils/event'
import {
	validateErrorMessage,
	validateAddressErrorMessage
} from '../test-lib/utils/error'
import {WEB3_URI} from '../test-lib/const'

contract(
	'MarketTest',
	([deployer, marketFactory, behavuor, user, propertyAuther]) => {
		const marketContract = artifacts.require('Market')
		describe('Market; constructor', () => {
			const dev = new DevProtocolInstance(deployer)
			beforeEach(async () => {
				await dev.generateAddressConfig()
			})
			it('Cannot be created from other than market factory', async () => {
				await dev.addressConfig.setMarketFactory(marketFactory)
				const result = await marketContract
					.new(dev.addressConfig.address, behavuor, {from: deployer})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Each property is set.', async () => {
				await Promise.all([
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
					dev.generatePolicySet()
				])
				await dev.addressConfig.setMarketFactory(marketFactory)
				const iPolicyInstance = await dev.getPolicy('PolicyTest1', user)
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
		describe('Market; toEnable', () => {
			const dev = new DevProtocolInstance(deployer)
			let market: MarketInstance
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
					dev.generatePolicySet()
				])
				await dev.addressConfig.setMarketFactory(marketFactory)
				const iPolicyInstance = await dev.getPolicy('PolicyTest1', user)
				await dev.policyFactory.create(iPolicyInstance.address)
				market = await marketContract.new(dev.addressConfig.address, behavuor, {
					from: marketFactory
				})
			})
			it('Cannot be enabled from other than market factory', async () => {
				const result = await market.toEnable().catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Can be enabled from the market factory', async () => {
				await market.toEnable({from: marketFactory})
				expect(await market.enabled()).to.be.equal(true)
			})
		})
		describe('Market; schema', () => {
			const dev = new DevProtocolInstance(deployer)
			it('Get Schema of mapped Behavior Contract', async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
					dev.generatePolicySet()
				])
				await dev.addressConfig.setMarketFactory(marketFactory)
				const iPolicyInstance = await dev.getPolicy('PolicyTest1', user)
				await dev.policyFactory.create(iPolicyInstance.address)
				const behavuor = await dev.getMarket('MarketTest1', user)
				const market = await marketContract.new(
					dev.addressConfig.address,
					behavuor.address,
					{from: marketFactory}
				)
				expect(await market.schema()).to.be.equal('[]')
			})
		})
		describe('Market; authenticate, authenticatedCallback', () => {
			const dev = new DevProtocolInstance(deployer)
			let marketAddress1: string
			let marketAddress2: string
			let propertyAddress: string
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generateMarketFactory(),
					dev.generateMarketGroup(),
					dev.generateMetricsFactory(),
					dev.generateMetricsGroup(),
					dev.generateVoteTimes(),
					dev.generateVoteTimesStorage(),
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
					dev.generatePolicySet(),
					dev.generatePropertyFactory(),
					dev.generatePropertyGroup(),
					dev.generateLockup(),
					dev.generateLockupStorage(),
					dev.generateDev()
				])
				const behavuor1 = await dev.getMarket('MarketTest3', user)
				const behavuor2 = await dev.getMarket('MarketTest3', user)
				const iPolicyInstance = await dev.getPolicy('PolicyTest1', user)
				await dev.policyFactory.create(iPolicyInstance.address)
				let createMarketResult = await dev.marketFactory.create(
					behavuor1.address
				)
				marketAddress1 = getMarketAddress(createMarketResult)
				createMarketResult = await dev.marketFactory.create(behavuor2.address)
				marketAddress2 = getMarketAddress(createMarketResult)
				const createPropertyResult = await dev.propertyFactory.create(
					'test',
					'TEST',
					propertyAuther
				)
				propertyAddress = getPropertyAddress(createPropertyResult)
				await dev.dev.mint(propertyAuther, 10000000000, {from: deployer})
			})
			it('Proxy to mapped Behavior Contract.', async () => {
				await dev.dev.deposit(propertyAddress, 100000, {from: propertyAuther})
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				const metricsAddress = await new Promise<string>(resolve => {
					marketInstance.authenticate(
						propertyAddress,
						'id-key',
						'',
						'',
						'',
						'',
						{from: propertyAuther}
					)
					watch(dev.metricsFactory, WEB3_URI)('Create', (_, values) =>
						resolve(values._metrics)
					)
				})
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const metrics = await artifacts.require('Metrics').at(metricsAddress)
				expect(await metrics.market()).to.be.equal(marketAddress1)
				expect(await metrics.property()).to.be.equal(propertyAddress)
				const tmp = await dev.dev.balanceOf(propertyAuther)
				expect(tmp.toNumber()).to.be.equal(9999800000)
			})
			it('Market that is not enabled generates an error when performing authentication function.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress2)
				const result = await marketInstance
					.authenticate(propertyAddress, 'id-key', '', '', '', '', {
						from: propertyAuther
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'market is not enabled')
			})
			it('Error occurs if id is not set.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				const result = await marketInstance
					.authenticate(propertyAddress, '', '', '', '', '', {
						from: propertyAuther
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'id is required')
			})
			it('Should fail to run when sent from other than the owner of Property Contract.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				const result = await marketInstance
					.authenticate(propertyAddress, 'id-key', '', '', '', '')
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('An error occurs if the same id is specified.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				await marketInstance.authenticate(
					propertyAddress,
					'id-key',
					'',
					'',
					'',
					'',
					{from: propertyAuther}
				)
				const result = await marketInstance
					.authenticate(propertyAddress, 'id-key', '', '', '', '', {
						from: propertyAuther
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'id is duplicated')
			})

			it('Should fail to deauthenticate when sent from other than passed metrics linked property author.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				const metricsAddress = await new Promise<string>(resolve => {
					marketInstance.authenticate(
						propertyAddress,
						'id-key',
						'',
						'',
						'',
						'',
						{from: propertyAuther}
					)
					watch(dev.metricsFactory, WEB3_URI)('Create', (_, values) =>
						resolve(values._metrics)
					)
				})
				const result = await marketInstance
					.deauthenticate(metricsAddress, {from: user})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'this is illegal address')
			})
			it('When deauthenticate, decrease the issuedMetrics, emit the Destroy event.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				const metricsAddress = await new Promise<string>(resolve => {
					marketInstance.authenticate(
						propertyAddress,
						'id-key',
						'',
						'',
						'',
						'',
						{from: propertyAuther}
					)
					watch(dev.metricsFactory, WEB3_URI)('Create', (_, values) =>
						resolve(values._metrics)
					)
				})
				let count = await marketInstance.issuedMetrics()
				expect(count.toNumber()).to.be.equal(1)
				await marketInstance.deauthenticate(metricsAddress, {
					from: propertyAuther
				})
				count = await marketInstance.issuedMetrics()
				expect(count.toNumber()).to.be.equal(0)
				const [_from, _metrics] = await new Promise<string[]>(resolve => {
					watch(dev.metricsFactory, WEB3_URI)('Destroy', (_, values) => {
						const {_from, _metrics} = values
						resolve([_from, _metrics])
					})
				})
				expect(_from).to.be.equal(marketAddress1)
				expect(_metrics).to.be.equal(metricsAddress)
			})
			it('Should fail to deauthenticate when passed already deauthenticated metrics.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				const metricsAddress = await new Promise<string>(resolve => {
					marketInstance.authenticate(
						propertyAddress,
						'id-key',
						'',
						'',
						'',
						'',
						{from: propertyAuther}
					)
					watch(dev.metricsFactory, WEB3_URI)('Create', (_, values) =>
						resolve(values._metrics)
					)
				})
				await marketInstance.deauthenticate(metricsAddress, {
					from: propertyAuther
				})
				const result = await marketInstance
					.deauthenticate(metricsAddress, {
						from: propertyAuther
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'not authenticated')
			})
		})

		describe('Market; vote', () => {
			const dev = new DevProtocolInstance(deployer)
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
				const iPolicyInstance = await dev.getPolicy('PolicyTest1', user)
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

			it('An error occurs if anything other than property address is specified.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress)
				const result = await marketInstance
					.vote(deployer, true, {from: user})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('voting deadline is over.', async () => {
				const createMarketResult = await dev.marketFactory.create(behavuor)
				marketAddress = getMarketAddress(createMarketResult)
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
				validateErrorMessage(result, 'voting deadline is over')
			})
			it('Should fail to vote when already determined enabled.', async () => {
				await dev.dev.deposit(propertyAddress, 10000, {from: user})
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress)
				// Await marketInstance.vote(propertyAddress, true, {from: user})
				expect(await marketInstance.enabled()).to.be.equal(true)
				const result = await marketInstance
					.vote(propertyAddress, true, {from: user})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'market is already enabled')
			})

			it('If you specify true, it becomes a valid vote.', async () => {
				const createMarketResult = await dev.marketFactory.create(behavuor)
				marketAddress = getMarketAddress(createMarketResult)
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
				const createMarketResult = await dev.marketFactory.create(behavuor)
				marketAddress = getMarketAddress(createMarketResult)
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
				const createMarketResult = await dev.marketFactory.create(behavuor)
				marketAddress = getMarketAddress(createMarketResult)
				await dev.dev.deposit(propertyAddress, 9000, {from: user})
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress)
				await marketInstance.vote(propertyAddress, true, {from: user})
				expect(await marketInstance.enabled()).to.be.equal(false)
			})
			it('Becomes valid when the number of valid votes exceeds the specified number.', async () => {
				const createMarketResult = await dev.marketFactory.create(behavuor)
				marketAddress = getMarketAddress(createMarketResult)
				await dev.dev.deposit(propertyAddress, 10000, {from: user})
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress)
				await marketInstance.vote(propertyAddress, true, {from: user})
				expect(await marketInstance.enabled()).to.be.equal(true)
			})
		})
	}
)
