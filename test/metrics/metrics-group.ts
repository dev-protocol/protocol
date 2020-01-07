import {DevProtocolInstance} from '../test-lib/instance'
import {validateErrorMessage} from '../test-lib/error-utils'

contract(
	'MetricsGroupTest',
	([deployer, metricsFactory, metrics1, metrics2, dummyMetrics]) => {
		const dev = new DevProtocolInstance(deployer)
		before(async () => {
			await dev.generateAddressConfig()
			await dev.generateMetricsGroup()
			await dev.addressConfig.setMetricsFactory(metricsFactory, {
				from: deployer
			})
		})
		describe('MetricsGroup; addGroup, isGroup', () => {
			before(async () => {
				await dev.metricsGroup.addGroup(metrics1, {
					from: metricsFactory
				})
			})
			it('When the metrics address is Specified', async () => {
				const result = await dev.metricsGroup.isGroup(metrics1)
				expect(result).to.be.equal(true)
			})
			it('When the metrics address is not specified', async () => {
				const result = await dev.metricsGroup.isGroup(dummyMetrics)
				expect(result).to.be.equal(false)
			})
			it('Existing metrics cannot be added', async () => {
				const result = await dev.metricsGroup
					.addGroup(metrics1, {
						from: metricsFactory
					})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'already enabled')
			})
		})
		describe('MetricsGroup; totalIssuedMetrics', () => {
			it('Count increases when metrics are added', async () => {
				let result = await dev.metricsGroup.totalIssuedMetrics()
				expect(result.toNumber()).to.be.equal(1)
				await dev.metricsGroup.addGroup(metrics2, {
					from: metricsFactory
				})
				result = await dev.metricsGroup.totalIssuedMetrics()
				expect(result.toNumber()).to.be.equal(2)
			})
		})
	}
)
