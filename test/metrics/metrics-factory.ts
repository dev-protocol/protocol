import {DevProtocolInstance} from '../test-lib/instance'
import {getMetricsAddress} from '../test-lib/utils/log'
import {watch} from '../test-lib/utils/event'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
	validatePauseErrorMessage,
	validatePauseOnlyOwnerErrorMessage
} from '../test-lib/utils/error'
import {WEB3_URI} from '../test-lib/const'

contract(
	'MetricsFactoryTest',
	([
		deployer,
		user,
		market,
		marketFactory,
		property1,
		property2,
		dummyMetrics
	]) => {
		describe('MetircsFactory; create', () => {
			const dev = new DevProtocolInstance(deployer)
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
				const [from, metrics] = await new Promise<string[]>(resolve => {
					watch(dev.metricsFactory, WEB3_URI)('Create', (_, values) => {
						const {_from, _metrics} = values
						resolve([_from, _metrics])
					})
				})
				expect(market).to.be.equal(from)
				expect(metricsAddress).to.be.equal(metrics)
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
				validatePauseOnlyOwnerErrorMessage(result)
				await dev.metricsFactory.pause({from: deployer})
				result = await dev.metricsFactory
					.unpause({from: user})
					.catch((err: Error) => err)
				validatePauseOnlyOwnerErrorMessage(result)
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
			it('Can be executed when pause is released.', async () => {
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
		describe('MetircsFactory; destroy', () => {
			const dev = new DevProtocolInstance(deployer)
			let metricsAddress1: string
			let metricsAddress2: string
			before(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generateMarketGroup(),
					dev.generateMetricsFactory(),
					dev.generateMetricsGroup()
				])
				await dev.addressConfig.setMarketFactory(marketFactory)
				await dev.marketGroup.addGroup(market, {from: marketFactory})
				const metricsFactoryResult1 = await dev.metricsFactory.create(
					property1,
					{from: market}
				)
				const metricsFactoryResult2 = await dev.metricsFactory.create(
					property1,
					{from: market}
				)
				metricsAddress1 = getMetricsAddress(metricsFactoryResult1)
				metricsAddress2 = getMetricsAddress(metricsFactoryResult2)
			})
			it('If a non-metrics address is specified, an error will occur.', async () => {
				const result = await dev.metricsFactory
					.destroy(dummyMetrics, {
						from: market
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'address is not metrics')
			})
			it('If a metrics address is specified, the remove process is performed and the event is also issued.', async () => {
				let result = await dev.metricsGroup.isGroup(metricsAddress1, {
					from: deployer
				})
				expect(result).to.be.equal(true)
				await dev.metricsFactory.destroy(metricsAddress1, {
					from: market
				})
				result = await dev.metricsGroup.isGroup(metricsAddress1, {
					from: deployer
				})
				expect(result).to.be.equal(false)
				const [from, metrics] = await new Promise<string[]>(resolve => {
					watch(dev.metricsFactory, WEB3_URI)('Destroy', (_, values) => {
						const {_from, _metrics} = values
						resolve([_from, _metrics])
					})
				})
				expect(market).to.be.equal(from)
				expect(metricsAddress1).to.be.equal(metrics)
			})
			it('You can also run the destroy method in owner.', async () => {
				let result = await dev.metricsGroup.isGroup(metricsAddress2, {
					from: deployer
				})
				expect(result).to.be.equal(true)
				await dev.metricsFactory.destroy(metricsAddress2, {
					from: deployer
				})
				result = await dev.metricsGroup.isGroup(metricsAddress2, {
					from: deployer
				})
				expect(result).to.be.equal(false)
				const [from, metrics] = await new Promise<string[]>(resolve => {
					watch(dev.metricsFactory, WEB3_URI)('Destroy', (_, values) => {
						const {_from, _metrics} = values
						resolve([_from, _metrics])
					})
				})
				expect(deployer).to.be.equal(from)
				expect(metricsAddress2).to.be.equal(metrics)
			})
			it('Cannot be executed from other than market contract.', async () => {
				const result = await dev.metricsFactory
					.destroy(metricsAddress1, {
						from: user
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Cannot run if paused.', async () => {
				await dev.metricsFactory.pause({from: deployer})
				const result = await dev.metricsFactory
					.destroy(metricsAddress1, {
						from: market
					})
					.catch((err: Error) => err)
				validatePauseErrorMessage(result)
			})
		})
	}
)
