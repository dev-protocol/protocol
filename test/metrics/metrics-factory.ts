import {DevProtocolInstance} from '../test-lib/instance'
import {getMetricsAddress} from '../test-lib/utils/log'
import {
	validateErrorMessage,
	validateAddressErrorMessage
} from '../test-lib/utils/error'

contract(
	'MetricsFactoryTest',
	([deployer, user, market, marketFactory, property1, property2]) => {
		const dev = new DevProtocolInstance(deployer)
		describe('MetircsFactory; create', () => {
			let metricsAddress: string
			before(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generateMarketGroup(),
					dev.generateMetricsFactory(),
					dev.generateMetricsGroup()
				])
				await dev.addressConfig.setMarketFactory(marketFactory)
				await dev.marketGroup.addGroup(market, {from: marketFactory})
				const metricsFactoryResult = await dev.metricsFactory.create(
					property1,
					{from: market}
				)
				metricsAddress = getMetricsAddress(metricsFactoryResult)
			})

			it('Adds a new metrics contract address to state contract,', async () => {
				const result = await dev.metricsGroup.isGroup(metricsAddress, {
					from: deployer
				})
				expect(result).to.be.equal(true)
			})

			it('Cannot be executed from other than market contract.', async () => {
				const result = await dev.metricsFactory
					.create(property2, {
						from: user
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Pause and release of pause can only be executed by deployer.', async () => {
				let result = await dev.metricsFactory
					.pause({from: user})
					.catch((err: Error) => err)
				validateErrorMessage(
					result,
					'PauserRole: caller does not have the Pauser role'
				)
				await dev.metricsFactory.pause({from: deployer})
				result = await dev.metricsFactory
					.unpause({from: user})
					.catch((err: Error) => err)
				validateErrorMessage(
					result,
					'PauserRole: caller does not have the Pauser role'
				)
				await dev.metricsFactory.unpause({from: deployer})
			})
			it('Cannot run if paused.', async () => {
				await dev.metricsFactory.pause({from: deployer})
				const result = await dev.metricsFactory
					.create(property2, {
						from: market
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'You cannot use that')
			})
			it('Can be executed when pause is released', async () => {
				await dev.metricsFactory.unpause({from: deployer})
				let createResult = await dev.metricsFactory.create(property2, {
					from: market
				})
				const tmpMetricsAddress = getMetricsAddress(createResult)
				const result = await dev.metricsGroup.isGroup(tmpMetricsAddress, {
					from: deployer
				})
				expect(result).to.be.equal(true)
			})
		})
	}
)
