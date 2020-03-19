import {DevProtocolInstance} from '../test-lib/instance'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
	validatePauseErrorMessage,
	validatePauseOnlyOwnerErrorMessage
} from '../test-lib/utils/error'

contract(
	'MetricsGroupTest',
	([
		deployer,
		metricsFactory,
		dummyMetricsFactory,
		metrics1,
		metrics2,
		dummyMetrics,
		user1
	]) => {
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
				validateErrorMessage(result, 'already enabled')
			})
			it('Can not execute addGroup without metricsFactory address', async () => {
				const result = await dev.metricsGroup
					.addGroup(dummyMetrics, {
						from: dummyMetricsFactory
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
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
		describe('MetricsGroup; pause', () => {
			it('if you pause, you cannot execute functions', async () => {
				await dev.metricsGroup.pause()
				let res = await dev.metricsGroup
					.addGroup(metrics1)
					.catch((err: Error) => err)
				validatePauseErrorMessage(res)
				res = await dev.metricsGroup
					.removeGroup(metrics1)
					.catch((err: Error) => err)
				validatePauseErrorMessage(res)
			})
			it('if you pause, you cannot execute functions', async () => {
				const res = await dev.metricsGroup
					.pause({from: user1})
					.catch((err: Error) => err)
				validatePauseOnlyOwnerErrorMessage(res)
			})
		})
	}
)
