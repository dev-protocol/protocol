import BigNumber from 'bignumber.js'
import { DevProtocolInstance } from '../test-lib/instance'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
	validateNotOwnerErrorMessage,
} from '../test-lib/utils/error'

contract(
	'MetricsGroup',
	([
		deployer,
		metricsFactory,
		dummyMetricsFactory,
		dummyMetrics,
		dummyMarket,
		dummyProperty1,
		dummyProperty2,
		user,
	]) => {
		const init = async (): Promise<
			[DevProtocolInstance, string, string, string]
		> => {
			const dev = new DevProtocolInstance(deployer)
			await dev.generateAddressConfig()
			await dev.generateMetricsGroup()
			await dev.addressConfig.setMetricsFactory(metricsFactory, {
				from: deployer,
			})
			const [metrics1, metrics2, metrics3] = await Promise.all([
				dev.createMetrics(dummyMarket, dummyProperty1).then((x) => x.address),
				dev.createMetrics(dummyMarket, dummyProperty1).then((x) => x.address),
				dev.createMetrics(dummyMarket, dummyProperty2).then((x) => x.address),
			])
			return [dev, metrics1, metrics2, metrics3]
		}

		describe('MetricsGroup; addGroup, removeGroup, isGroup', () => {
			it('You can get the number of properties being authenticated.', async () => {
				const [dev, metrics1, metrics2, metrics3] = await init()
				const before: BigNumber =
					await dev.metricsGroup.totalAuthenticatedProperties()
				expect(before.toString()).to.be.equal('0')
				await dev.metricsGroup.addGroup(metrics1, {
					from: metricsFactory,
				})
				let after: BigNumber =
					await dev.metricsGroup.totalAuthenticatedProperties()
				expect(after.toString()).to.be.equal('1')
				await dev.metricsGroup.addGroup(metrics2, {
					from: metricsFactory,
				})
				after = await dev.metricsGroup.totalAuthenticatedProperties()
				expect(after.toString()).to.be.equal('1')
				await dev.metricsGroup.addGroup(metrics3, {
					from: metricsFactory,
				})
				after = await dev.metricsGroup.totalAuthenticatedProperties()
				expect(after.toString()).to.be.equal('2')
				await dev.metricsGroup.removeGroup(metrics2, {
					from: metricsFactory,
				})
				after = await dev.metricsGroup.totalAuthenticatedProperties()
				expect(after.toString()).to.be.equal('2')
				await dev.metricsGroup.removeGroup(metrics1, {
					from: metricsFactory,
				})
				after = await dev.metricsGroup.totalAuthenticatedProperties()
				expect(after.toString()).to.be.equal('1')
				await dev.metricsGroup.removeGroup(metrics3, {
					from: metricsFactory,
				})
				after = await dev.metricsGroup.totalAuthenticatedProperties()
				expect(after.toString()).to.be.equal('0')
			})

			it('When the metrics address is Specified.', async () => {
				const [dev, metrics1] = await init()
				await dev.metricsGroup.addGroup(metrics1, {
					from: metricsFactory,
				})
				const result = await dev.metricsGroup.isGroup(metrics1)
				expect(result).to.be.equal(true)
			})
			it('When the metrics address is not specified.', async () => {
				const [dev, metrics1] = await init()
				await dev.metricsGroup.addGroup(metrics1, {
					from: metricsFactory,
				})
				const result = await dev.metricsGroup.isGroup(dummyMetrics)
				expect(result).to.be.equal(false)
			})
			it('Should fail to call addGroup when sent from other than MetricsFactory', async () => {
				const [dev, metrics1] = await init()
				const result = await dev.metricsGroup
					.addGroup(metrics1, {
						from: deployer,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Existing metrics cannot be added.', async () => {
				const [dev, metrics1] = await init()
				await dev.metricsGroup.addGroup(metrics1, {
					from: metricsFactory,
				})
				const result = await dev.metricsGroup
					.addGroup(metrics1, {
						from: metricsFactory,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'already enabled')
			})
			it('Can not execute addGroup without metricsFactory address.', async () => {
				const [dev] = await init()
				const result = await dev.metricsGroup
					.addGroup(dummyMetrics, {
						from: dummyMetricsFactory,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Should fail to call removeGroup when sent from other than MetricsFactory', async () => {
				const [dev, metrics1] = await init()
				await dev.metricsGroup.addGroup(metrics1, {
					from: metricsFactory,
				})
				const result = await dev.metricsGroup
					.removeGroup(metrics1, {
						from: deployer,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Can not execute removeGroup without metricsFactory address.', async () => {
				const [dev, metrics1] = await init()
				await dev.metricsGroup.addGroup(metrics1, {
					from: metricsFactory,
				})
				const result = await dev.metricsGroup
					.removeGroup(metrics1, {
						from: dummyMetricsFactory,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Not existing metrics cannot be removed.', async () => {
				const [dev, metrics1] = await init()
				await dev.metricsGroup.addGroup(metrics1, {
					from: metricsFactory,
				})
				const result = await dev.metricsGroup
					.removeGroup(dummyMetrics, {
						from: metricsFactory,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'address is not group')
			})
			it('Deleted metrics addresses are treated as if they do not exist in the group.', async () => {
				const [dev, metrics1] = await init()
				await dev.metricsGroup.addGroup(metrics1, {
					from: metricsFactory,
				})
				await dev.metricsGroup.removeGroup(metrics1, { from: metricsFactory })
				const result = await dev.metricsGroup.isGroup(metrics1)
				expect(result).to.be.equal(false)
			})
		})
		describe('MetricsGroup; totalIssuedMetrics', () => {
			it('Count increases when metrics are added.', async () => {
				const [dev, , metrics2] = await init()
				let result = await dev.metricsGroup.totalIssuedMetrics()
				expect(result.toNumber()).to.be.equal(0)
				await dev.metricsGroup.addGroup(metrics2, {
					from: metricsFactory,
				})
				result = await dev.metricsGroup.totalIssuedMetrics()
				expect(result.toNumber()).to.be.equal(1)
				await dev.metricsGroup.removeGroup(metrics2, {
					from: metricsFactory,
				})
				result = await dev.metricsGroup.totalIssuedMetrics()
				expect(result.toNumber()).to.be.equal(0)
			})
		})
		describe('MetricsGroup; getMetricsCountPerProperty', () => {
			it('Count increases when metrics are added.', async () => {
				const [dev, , metrics2] = await init()
				let result = await dev.metricsGroup.getMetricsCountPerProperty(
					dummyProperty1
				)
				expect(result.toNumber()).to.be.equal(0)
				await dev.metricsGroup.addGroup(metrics2, {
					from: metricsFactory,
				})
				result = await dev.metricsGroup.getMetricsCountPerProperty(
					dummyProperty1
				)
				expect(result.toNumber()).to.be.equal(1)
				await dev.metricsGroup.removeGroup(metrics2, {
					from: metricsFactory,
				})
				result = await dev.metricsGroup.getMetricsCountPerProperty(
					dummyProperty1
				)
				expect(result.toNumber()).to.be.equal(0)
			})
		})
		describe('MetricsGroup; hasAssets', () => {
			it('Returns whether the passed Property has some assets', async () => {
				const [dev, , metrics2] = await init()
				let result = await dev.metricsGroup.hasAssets(dummyProperty1)
				expect(result).to.be.equal(false)
				await dev.metricsGroup.addGroup(metrics2, {
					from: metricsFactory,
				})
				result = await dev.metricsGroup.hasAssets(dummyProperty1)
				expect(result).to.be.equal(true)
				await dev.metricsGroup.removeGroup(metrics2, {
					from: metricsFactory,
				})
				result = await dev.metricsGroup.hasAssets(dummyProperty1)
				expect(result).to.be.equal(false)
			})
		})
	}
)
