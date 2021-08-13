import { DevProtocolInstance } from '../test-lib/instance'
import { getMetricsAddress } from '../test-lib/utils/log'
import { watch } from '../test-lib/utils/event'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
} from '../test-lib/utils/error'

contract(
	'MetricsFactoryTest',
	([
		deployer,
		user,
		market,
		marketFactory,
		property1,
		property2,
		dummyMetrics,
	]) => {
		describe('MetircsFactory; create', () => {
			const dev = new DevProtocolInstance(deployer)
			before(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generateMarketGroup(),
					dev.generateMetricsFactory(),
					dev.generateMetricsGroup(),
				])
				await dev.addressConfig.setMarketFactory(marketFactory)
				await dev.marketGroup.addGroup(market, { from: marketFactory })
			})

			it('Adds a new metrics contract address to state contract,', async () => {
				dev.metricsFactory
					.create(property1, {
						from: market,
					})
					.catch(console.error)
				const [from, metrics] = await new Promise<string[]>((resolve) => {
					watch(dev.metricsFactory)('Create', (_, values) => {
						const { _from, _metrics } = values
						resolve([_from, _metrics])
					})
				})
				expect(market).to.be.equal(from)
				const result = await dev.metricsGroup.isGroup(metrics, {
					from: deployer,
				})
				expect(result).to.be.equal(true)
			})
			it('Cannot be executed from other than market contract.', async () => {
				const result = await dev.metricsFactory
					.create(property2, {
						from: user,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('MetircsFactory; destroy', () => {
			const dev = new DevProtocolInstance(deployer)
			let metricsAddress1: string
			let metricsAddress2: string
			before(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generateMarketGroup(),
					dev.generateMetricsFactory(),
					dev.generateMetricsGroup(),
				])
				await dev.addressConfig.setMarketFactory(marketFactory)
				await dev.marketGroup.addGroup(market, { from: marketFactory })
				const metricsFactoryResult1 = await dev.metricsFactory.create(
					property1,
					{ from: market }
				)
				const metricsFactoryResult2 = await dev.metricsFactory.create(
					property1,
					{ from: market }
				)
				metricsAddress1 = getMetricsAddress(metricsFactoryResult1)
				metricsAddress2 = getMetricsAddress(metricsFactoryResult2)
			})
			it('Should fail to destroy when passed other than metrics address.', async () => {
				const result = await dev.metricsFactory
					.destroy(dummyMetrics, {
						from: market,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'address is not metrics')
			})
			it('Should fail to destroy when sent from other than a Market. ', async () => {
				const result = await dev.metricsFactory
					.destroy(metricsAddress1, {
						from: user,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('When call the destroy, remove the metrics from MetricsGroup, emit Destroy event.', async () => {
				let result = await dev.metricsGroup.isGroup(metricsAddress1, {
					from: deployer,
				})
				expect(result).to.be.equal(true)
				dev.metricsFactory
					.destroy(metricsAddress1, {
						from: market,
					})
					.catch(console.error)
				const [from, metrics] = await new Promise<string[]>((resolve) => {
					watch(dev.metricsFactory)('Destroy', (_, values) => {
						const { _from, _metrics } = values
						resolve([_from, _metrics])
					})
				})
				result = await dev.metricsGroup.isGroup(metricsAddress1, {
					from: deployer,
				})
				expect(result).to.be.equal(false)
				expect(market).to.be.equal(from)
				expect(metricsAddress1).to.be.equal(metrics)
			})
			it('can not also run the destroy method in owner.', async () => {
				const result = await dev.metricsGroup.isGroup(metricsAddress2, {
					from: deployer,
				})
				expect(result).to.be.equal(true)
				const destroｙResult = await dev.metricsFactory
					.destroy(metricsAddress2, {
						from: deployer,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(destroｙResult)
			})
		})
	}
)
