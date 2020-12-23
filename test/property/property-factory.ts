/* eslint-disable max-nested-callbacks */
import { DevProtocolInstance } from '../test-lib/instance'
import { getPropertyAddress, getMarketAddress } from '../test-lib/utils/log'
import { toBigNumber } from '../test-lib/utils/common'
import { getEventValue } from '../test-lib/utils/event'
import { validateErrorMessage } from '../test-lib/utils/error'

contract(
	'PropertyFactoryTest',
	([
		deployer,
		user,
		user2,
		marketFactory,
		dummyProperFactory,
		dummyProperty,
		beforeAuthor,
		afterAuthor,
	]) => {
		describe('PropertyFactory; create', () => {
			const dev = new DevProtocolInstance(deployer)
			const propertyContract = artifacts.require('Property')
			let propertyAddress: string
			before(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generatePropertyFactory(),
					dev.generatePropertyGroup(),
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
				])
				await dev.generatePolicy()
				await dev.addressConfig.setMarketFactory(marketFactory)
				const result = await dev.propertyFactory.create(
					'sample',
					'SAMPLE',
					user,
					{
						from: user2,
					}
				)
				propertyAddress = getPropertyAddress(result)
			})
			it('Create a new property contract and emit create event telling created property address', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const deployedProperty = await propertyContract.at(propertyAddress)
				const name = await deployedProperty.name({ from: user2 })
				const symbol = await deployedProperty.symbol({ from: user2 })
				const decimals = await deployedProperty.decimals({ from: user2 })
				const totalSupply = await deployedProperty
					.totalSupply({ from: user2 })
					.then(toBigNumber)
				const author = await deployedProperty.author({ from: user2 })
				expect(name).to.be.equal('sample')
				expect(symbol).to.be.equal('SAMPLE')
				expect(decimals.toNumber()).to.be.equal(18)
				expect(totalSupply.toFixed()).to.be.equal(
					toBigNumber(1000).times(10000).times(1e18).toFixed()
				)
				expect(author).to.be.equal(user)
			})

			it('Adds a new property contract address to state contract', async () => {
				const isProperty = await dev.propertyGroup.isGroup(propertyAddress)
				expect(isProperty).to.be.equal(true)
			})
		})
		describe('PropertyFactory; createChangeAuthorEvent', () => {
			it('an event is created.', async () => {
				const dev = new DevProtocolInstance(deployer)
				await dev.generateAddressConfig()
				await dev.generatePropertyGroup()
				await dev.addressConfig.setPropertyFactory(dummyProperFactory)
				await dev.propertyGroup.addGroup(dummyProperty, {
					from: dummyProperFactory,
				})
				await dev.generatePropertyFactory()
				const result = await dev.propertyFactory.createChangeAuthorEvent(
					beforeAuthor,
					afterAuthor,
					{
						from: dummyProperty,
					}
				)
				const event = result.logs[0].args
				expect(event._property).to.be.equal(dummyProperty)
				expect(event._beforeAuthor).to.be.equal(beforeAuthor)
				expect(event._afterAuthor).to.be.equal(afterAuthor)
			})

			it('cannot be executed from outside of a property.', async () => {
				const dev = new DevProtocolInstance(deployer)
				await dev.generateAddressConfig()
				await dev.generatePropertyGroup()
				await dev.generatePropertyFactory()
				const result = await dev.propertyFactory
					.createChangeAuthorEvent(beforeAuthor, afterAuthor)
					.catch((err: Error) => err)
				validateErrorMessage(result, 'this is illegal address')
			})
		})
		describe('PropertyFactory; createAndAuthenticate', () => {
			const dev = new DevProtocolInstance(deployer)
			let marketAddress: string
			before(async () => {
				await dev.generateAddressConfig()
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
					dev.generateDev(),
					dev.generateWithdraw(),
					dev.generateAllocator(),
				])
				await dev.generatePolicy('PolicyTest1')
				const market = await dev.getMarket('MarketTest1', user)
				await dev.marketFactory.create(market.address, {
					from: user,
				})
			})
			describe('PropertyFactory; createAndAuthenticate', () => {
				const dev = new DevProtocolInstance(deployer)
				let marketAddress: string
				before(async () => {
					await dev.generateAddressConfig()
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
						dev.generateDev(),
						dev.generateWithdraw(),
						dev.generateAllocator(),
					])
					await dev.generatePolicy('PolicyTest1')
					const market = await dev.getMarket('MarketTest1', user)
					const result = await dev.marketFactory.create(market.address, {
						from: user,
					})
					await dev.dev.mint(user, 10000000000)
					marketAddress = getMarketAddress(result)
					await (market as any).setAssociatedMarket(marketAddress, {
						from: user,
					})
				})

				it('Create a new Property and authenticate at the same time', async () => {
					;(dev.propertyFactory as any)
						.createAndAuthenticate(
							'example',
							'EXAMPLE',
							marketAddress,
							'test',
							'',
							'',
							{ from: user }
						)
						.catch(console.error)
					const [
						propertyCreator,
						property,
						market,
						metrics,
					] = await Promise.all([
						getEventValue(dev.propertyFactory)('Create', '_from'),
						getEventValue(dev.propertyFactory)('Create', '_property'),
						getEventValue(dev.metricsFactory)('Create', '_from'),
						getEventValue(dev.metricsFactory)('Create', '_metrics'),
					])
					const linkedProperty = await Promise.all([
						artifacts.require('Metrics').at(metrics as string),
					]).then(async ([c]) => c.property())
					const propertyAuthor = await Promise.all([
						artifacts.require('Property').at(property as string),
					]).then(async ([c]) => c.author())
					expect(propertyCreator).to.be.equal(user)
					expect(propertyAuthor).to.be.equal(user)
					expect(property).to.be.equal(linkedProperty)
					expect(market).to.be.equal(marketAddress)
				})
			})
		})
	}
)
