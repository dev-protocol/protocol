// import {DevProtocolInstance} from '../test-lib/instance'
// import {
// 	validateErrorMessage,
// 	validateAddressErrorMessage,
// } from '../test-lib/utils/error'

// contract(
// 	'MetricsGroupTest',
// 	([
// 		deployer,
// 		metricsFactory,
// 		dummyMetricsFactory,
// 		metrics1,
// 		metrics2,
// 		dummyMetrics,
// 	]) => {
// 		const dev = new DevProtocolInstance(deployer)
// 		before(async () => {
// 			await dev.generateAddressConfig()
// 			await dev.generateMetricsGroup()
// 			await dev.addressConfig.setMetricsFactory(metricsFactory, {
// 				from: deployer,
// 			})
// 		})
// 		describe('MetricsGroup; addGroup, removeGroup, isGroup', () => {
// 			before(async () => {
// 				await dev.metricsGroup.addGroup(metrics1, {
// 					from: metricsFactory,
// 				})
// 			})
// 			it('When the metrics address is Specified.', async () => {
// 				const result = await dev.metricsGroup.isGroup(metrics1)
// 				expect(result).to.be.equal(true)
// 			})
// 			it('When the metrics address is not specified.', async () => {
// 				const result = await dev.metricsGroup.isGroup(dummyMetrics)
// 				expect(result).to.be.equal(false)
// 			})
// 			it('Should fail to call addGroup when sent from other than MetricsFactory', async () => {
// 				const result = await dev.metricsGroup
// 					.addGroup(metrics1, {
// 						from: deployer,
// 					})
// 					.catch((err: Error) => err)
// 				validateAddressErrorMessage(result)
// 			})
// 			it('Existing metrics cannot be added.', async () => {
// 				const result = await dev.metricsGroup
// 					.addGroup(metrics1, {
// 						from: metricsFactory,
// 					})
// 					.catch((err: Error) => err)
// 				validateErrorMessage(result, 'already enabled')
// 			})
// 			it('Can not execute addGroup without metricsFactory address.', async () => {
// 				const result = await dev.metricsGroup
// 					.addGroup(dummyMetrics, {
// 						from: dummyMetricsFactory,
// 					})
// 					.catch((err: Error) => err)
// 				validateAddressErrorMessage(result)
// 			})
// 			it('Should fail to call removeGroup when sent from other than MetricsFactory', async () => {
// 				const result = await dev.metricsGroup
// 					.removeGroup(metrics1, {
// 						from: deployer,
// 					})
// 					.catch((err: Error) => err)
// 				validateAddressErrorMessage(result)
// 			})
// 			it('Can not execute removeGroup without metricsFactory address.', async () => {
// 				const result = await dev.metricsGroup
// 					.removeGroup(metrics1, {
// 						from: dummyMetricsFactory,
// 					})
// 					.catch((err: Error) => err)
// 				validateAddressErrorMessage(result)
// 			})
// 			it('Not existing metrics cannot be removed.', async () => {
// 				const result = await dev.metricsGroup
// 					.removeGroup(dummyMetrics, {
// 						from: metricsFactory,
// 					})
// 					.catch((err: Error) => err)
// 				validateErrorMessage(result, 'address is not group')
// 			})
// 			it('existing metrics can be removed.', async () => {
// 				await dev.metricsGroup.removeGroup(metrics1, {from: metricsFactory})
// 			})
// 			it('Deleted metrics addresses are treated as if they do not exist in the group.', async () => {
// 				const result = await dev.metricsGroup.isGroup(metrics1)
// 				expect(result).to.be.equal(false)
// 			})
// 		})
// 		describe('MetricsGroup; totalIssuedMetrics', () => {
// 			it('Count increases when metrics are added.', async () => {
// 				let result = await dev.metricsGroup.totalIssuedMetrics()
// 				expect(result.toNumber()).to.be.equal(0)
// 				await dev.metricsGroup.addGroup(metrics2, {
// 					from: metricsFactory,
// 				})
// 				result = await dev.metricsGroup.totalIssuedMetrics()
// 				expect(result.toNumber()).to.be.equal(1)
// 				await dev.metricsGroup.removeGroup(metrics2, {
// 					from: metricsFactory,
// 				})
// 				result = await dev.metricsGroup.totalIssuedMetrics()
// 				expect(result.toNumber()).to.be.equal(0)
// 			})
// 		})
// 	}
// )
