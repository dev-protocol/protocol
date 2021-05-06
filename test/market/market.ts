import { DevProtocolInstance } from '../test-lib/instance'
import { MarketInstance } from '../../types/truffle-contracts'
import { getPropertyAddress, getMarketAddress } from '../test-lib/utils/log'
import { watch } from '../test-lib/utils/event'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
} from '../test-lib/utils/error'

contract(
	'MarketTest',
	([deployer, marketFactory, behavuor, user, user1, propertyAuther]) => {
		const marketContract = artifacts.require('Market')
		describe('Market; constructor', () => {
			const dev = new DevProtocolInstance(deployer)
			beforeEach(async () => {
				await dev.generateAddressConfig()
			})
			it('Cannot be created from other than market factory', async () => {
				await dev.addressConfig.setMarketFactory(marketFactory)
				const result = await marketContract
					.new(dev.addressConfig.address, behavuor, { from: deployer })
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Each property is set.', async () => {
				await Promise.all([
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
				])
				await dev.addressConfig.setMarketFactory(marketFactory)
				const iPolicyInstance = await dev.getPolicy('PolicyTest1', user)
				await dev.policyFactory.create(iPolicyInstance.address)
				const market = await marketContract.new(
					dev.addressConfig.address,
					behavuor,
					{ from: marketFactory }
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
				])
				await dev.addressConfig.setMarketFactory(marketFactory)
				const iPolicyInstance = await dev.getPolicy('PolicyTest1', user)
				await dev.policyFactory.create(iPolicyInstance.address)
				market = await marketContract.new(dev.addressConfig.address, behavuor, {
					from: marketFactory,
				})
			})
			it('Cannot be enabled from other than market factory', async () => {
				const result = await market.toEnable().catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Can be enabled from the market factory', async () => {
				await market.toEnable({ from: marketFactory })
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
				])
				await dev.addressConfig.setMarketFactory(marketFactory)
				const iPolicyInstance = await dev.getPolicy('PolicyTest1', user)
				await dev.policyFactory.create(iPolicyInstance.address)
				const behavuor = await dev.getMarket('MarketTest1', user)
				const market = await marketContract.new(
					dev.addressConfig.address,
					behavuor.address,
					{ from: marketFactory }
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
				await dev.generateDev()
				await dev.generateDevMinter()
				await Promise.all([
					dev.generateMarketFactory(),
					dev.generateMarketGroup(),
					dev.generateMetricsFactory(),
					dev.generateMetricsGroup(),
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
					dev.generatePropertyFactory(),
					dev.generatePropertyGroup(),
					dev.generateLockup(),
					dev.generateWithdraw(),
					dev.generateAllocator(),
				])
				const behavior1 = await dev.getMarket('MarketTest3', user)
				const behavior2 = await dev.getMarket('MarketTest3', user)
				await dev.generatePolicy('PolicyTest1')
				let createMarketResult = await dev.marketFactory.create(
					behavior1.address
				)
				marketAddress1 = getMarketAddress(createMarketResult)
				await (behavior1 as any).setAssociatedMarket(marketAddress1, {
					from: user,
				})
				createMarketResult = await dev.marketFactory.create(behavior2.address)
				marketAddress2 = getMarketAddress(createMarketResult)
				await (behavior2 as any).setAssociatedMarket(marketAddress2, {
					from: user,
				})
				const createPropertyResult = await dev.propertyFactory.create(
					'test',
					'TEST',
					propertyAuther
				)
				propertyAddress = getPropertyAddress(createPropertyResult)
				await dev.metricsGroup.__setMetricsCountPerProperty(propertyAddress, 1)
				await dev.dev.mint(propertyAuther, 10000000000, { from: deployer })
			})
			it('Proxy to mapped Behavior Contract.', async () => {
				await dev.dev.deposit(propertyAddress, 100000, { from: propertyAuther })
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				marketInstance
					.authenticate(propertyAddress, 'id-key', '', '', '', '', {
						from: propertyAuther,
					})
					.catch(console.error)
				const metricsAddress = await new Promise<string>((resolve) => {
					watch(dev.metricsFactory)('Create', (_, values) => {
						resolve(values._metrics)
					})
				})
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const metrics = await artifacts.require('Metrics').at(metricsAddress)
				expect(await metrics.market()).to.be.equal(marketAddress1)
				expect(await metrics.property()).to.be.equal(propertyAddress)
				const tmp = await dev.dev.balanceOf(propertyAuther)
				expect(tmp.toNumber()).to.be.equal(9999800000)
				const behavuor = await marketInstance.behavior()
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const behavuorInstance = await artifacts
					.require('MarketTest3')
					.at(behavuor)
				const key = await behavuorInstance.getId(metrics.address)
				expect(key).to.be.equal('id-key')
			})
			it(`The sender's address is passed to Market Behavior.`, async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				await marketInstance.authenticate(
					propertyAddress,
					'id-key',
					'',
					'',
					'',
					'',
					{ from: propertyAuther }
				)
				const marketTest3 = artifacts.require('MarketTest3')
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketTest3Instance = await marketTest3.at(
					await marketInstance.behavior()
				)
				expect(
					await marketTest3Instance.currentAuthinticateAccount()
				).to.be.equal(propertyAuther)
			})
			it('Should fail to run when not enabled Market.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress2)
				const result = await marketInstance
					.authenticate(propertyAddress, 'id-key', '', '', '', '', {
						from: propertyAuther,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'market is not enabled')
			})
			it('Should fail to run when not passed the ID.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				const result = await marketInstance
					.authenticate(propertyAddress, '', '', '', '', '', {
						from: propertyAuther,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'id is required')
			})
			it('Should fail to run when sent from other than Property Factory Contract.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				const result = await marketInstance
					.authenticate(propertyAddress, 'id-key', '', '', '', '')
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Should fail to run when the passed ID is already authenticated.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				await marketInstance.authenticate(
					propertyAddress,
					'id-key',
					'',
					'',
					'',
					'',
					{ from: propertyAuther }
				)
				const result = await marketInstance
					.authenticate(propertyAddress, 'id-key', '', '', '', '', {
						from: propertyAuther,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'id is duplicated')
			})

			it('Should fail to deauthenticate when sent from other than passed metrics linked property author.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				marketInstance
					.authenticate(propertyAddress, 'id-key', '', '', '', '', {
						from: propertyAuther,
					})
					.catch(console.error)
				const metricsAddress = await new Promise<string>((resolve) => {
					watch(dev.metricsFactory)('Create', (_, values) => {
						resolve(values._metrics)
					})
				})
				const result = await marketInstance
					.deauthenticate(metricsAddress, { from: user })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'this is illegal address')
			})
			it('When deauthenticate, decrease the issuedMetrics, emit the Destroy event.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				marketInstance
					.authenticate(propertyAddress, 'id-key', '', '', '', '', {
						from: propertyAuther,
					})
					.catch(console.error)
				const metricsAddress = await new Promise<string>((resolve) => {
					watch(dev.metricsFactory)('Create', (_, values) => {
						resolve(values._metrics)
					})
				})
				let count = await marketInstance.issuedMetrics()
				expect(count.toNumber()).to.be.equal(1)
				marketInstance
					.deauthenticate(metricsAddress, {
						from: propertyAuther,
					})
					.catch(console.error)
				const [_from, _metrics] = await new Promise<string[]>((resolve) => {
					watch(dev.metricsFactory)('Destroy', (_, values) => {
						const { _from, _metrics } = values
						resolve([_from, _metrics])
					})
				})
				count = await marketInstance.issuedMetrics()
				expect(count.toNumber()).to.be.equal(0)
				expect(_from).to.be.equal(marketAddress1)
				expect(_metrics).to.be.equal(metricsAddress)
			})
			it('Should fail to deauthenticate when passed already deauthenticated metrics.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				marketInstance
					.authenticate(propertyAddress, 'id-key', '', '', '', '', {
						from: propertyAuther,
					})
					.catch(console.error)
				const metricsAddress = await new Promise<string>((resolve) => {
					watch(dev.metricsFactory)('Create', (_, values) => {
						resolve(values._metrics)
					})
				})
				await marketInstance.deauthenticate(metricsAddress, {
					from: propertyAuther,
				})
				const result = await marketInstance
					.deauthenticate(metricsAddress, {
						from: propertyAuther,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'not authenticated')
			})
		})
		describe('Market; authenticateFromPropertyFactory, authenticatedCallback', () => {
			const dev = new DevProtocolInstance(deployer)
			let marketAddress1: string
			let marketAddress2: string
			let propertyAddress: string
			const propertyFactory = user1
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await dev.generateDev()
				await dev.generateDevMinter()
				await Promise.all([
					dev.generateMarketFactory(),
					dev.generateMarketGroup(),
					dev.generateMetricsFactory(),
					dev.generateMetricsGroup(),
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
					dev.generatePropertyFactory(),
					dev.generatePropertyGroup(),
					dev.generateLockup(),
					dev.generateWithdraw(),
					dev.generateAllocator(),
				])
				const behavior1 = await dev.getMarket('MarketTest3', user)
				const behavior2 = await dev.getMarket('MarketTest3', user)
				await dev.generatePolicy('PolicyTest1')
				let createMarketResult = await dev.marketFactory.create(
					behavior1.address
				)
				marketAddress1 = getMarketAddress(createMarketResult)
				await (behavior1 as any).setAssociatedMarket(marketAddress1, {
					from: user,
				})
				createMarketResult = await dev.marketFactory.create(behavior2.address)
				marketAddress2 = getMarketAddress(createMarketResult)
				await (behavior2 as any).setAssociatedMarket(marketAddress2, {
					from: user,
				})
				const createPropertyResult = await dev.propertyFactory.create(
					'test',
					'TEST',
					propertyAuther
				)
				propertyAddress = getPropertyAddress(createPropertyResult)
				await dev.metricsGroup.__setMetricsCountPerProperty(propertyAddress, 1)
				await dev.dev.mint(propertyAuther, 10000000000, { from: deployer })
				await dev.addressConfig.setPropertyFactory(propertyFactory)
			})
			it('Proxy to mapped Behavior Contract.', async () => {
				await dev.dev.deposit(propertyAddress, 100000, { from: propertyAuther })
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				void marketInstance.authenticateFromPropertyFactory(
					propertyAddress,
					propertyAuther,
					'id-key',
					'',
					'',
					'',
					'',
					{
						from: propertyFactory,
					}
				)
				const metricsAddress = await new Promise<string>((resolve) => {
					watch(dev.metricsFactory)('Create', (_, values) => {
						resolve(values._metrics)
					})
				})
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const metrics = await artifacts.require('Metrics').at(metricsAddress)
				expect(await metrics.market()).to.be.equal(marketAddress1)
				expect(await metrics.property()).to.be.equal(propertyAddress)
				const tmp = await dev.dev.balanceOf(propertyAuther)
				expect(tmp.toNumber()).to.be.equal(9999800000)
				const behavuor = await marketInstance.behavior()
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const behavuorInstance = await artifacts
					.require('MarketTest3')
					.at(behavuor)
				const key = await behavuorInstance.getId(metrics.address)
				expect(key).to.be.equal('id-key')
			})
			it('The passed address is passed to Market Behavior.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				await marketInstance.authenticateFromPropertyFactory(
					propertyAddress,
					propertyAuther,
					'id-key',
					'',
					'',
					'',
					'',
					{ from: propertyFactory }
				)
				const marketTest3 = artifacts.require('MarketTest3')
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketTest3Instance = await marketTest3.at(
					await marketInstance.behavior()
				)
				expect(
					await marketTest3Instance.currentAuthinticateAccount()
				).to.be.equal(propertyAuther)
			})
			it('Should fail to run when not enabled Market.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress2)
				const result = await marketInstance
					.authenticateFromPropertyFactory(
						propertyAddress,
						propertyAuther,
						'id-key',
						'',
						'',
						'',
						'',
						{
							from: propertyFactory,
						}
					)
					.catch((err: Error) => err)
				validateErrorMessage(result, 'market is not enabled')
			})
			it('Should fail to run when not passed the ID.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				const result = await marketInstance
					.authenticateFromPropertyFactory(
						propertyAddress,
						propertyAuther,
						'',
						'',
						'',
						'',
						'',
						{
							from: propertyFactory,
						}
					)
					.catch((err: Error) => err)
				validateErrorMessage(result, 'id is required')
			})
			it('Should fail to run when sent from other than Property Factory Contract.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				const result = await marketInstance
					.authenticateFromPropertyFactory(
						propertyAddress,
						propertyAuther,
						'id-key',
						'',
						'',
						'',
						''
					)
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Should fail to run when the passed ID is already authenticated.', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const marketInstance = await marketContract.at(marketAddress1)
				await marketInstance.authenticate(
					propertyAddress,
					'id-key',
					'',
					'',
					'',
					'',
					{ from: propertyAuther }
				)
				const result = await marketInstance
					.authenticateFromPropertyFactory(
						propertyAddress,
						user,
						'id-key',
						'',
						'',
						'',
						'',
						{
							from: propertyFactory,
						}
					)
					.catch((err: Error) => err)
				validateErrorMessage(result, 'id is duplicated')
			})
		})
	}
)
