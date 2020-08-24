import {DevProtocolInstance} from '../test-lib/instance'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
} from '../test-lib/utils/error'
import {MetricsGroupMigrationInstance} from '../../types/truffle-contracts'
import {gasLogger} from '../test-lib/utils/common'

contract(
	'MetricsGroupMigaration',
	([
		deployer,
		user,
		metricsFactory,
		dummyMetricsFactory,
		dummyMetrics,
		dummyMarket,
		dummyProperty,
	]) => {
		const dev = new DevProtocolInstance(deployer)
		let metricsGroupMigaration: MetricsGroupMigrationInstance
		let metrics1: string
		let metrics2: string
		before(async () => {
			await dev.generateAddressConfig()
			await dev.generateMetricsGroup()
			metricsGroupMigaration = await artifacts
				.require('MetricsGroupMigration')
				.new(dev.addressConfig.address)
			await dev.addressConfig.setMetricsGroup(metricsGroupMigaration.address)
			await metricsGroupMigaration.createStorage()

			await dev.addressConfig.setMetricsFactory(metricsFactory, {
				from: deployer,
			})
			;[metrics1, metrics2] = await Promise.all([
				dev.createMetrics(dummyMarket, dummyProperty).then((x) => x.address),
				dev.createMetrics(dummyMarket, dummyProperty).then((x) => x.address),
			])
		})
		describe('MetricsGroupMigaration; addGroup, removeGroup, isGroup', () => {
			before(async () => {
				await metricsGroupMigaration.addGroup(metrics1, {
					from: metricsFactory,
				})
			})
			it('When the metrics address is Specified.', async () => {
				const result = await metricsGroupMigaration.isGroup(metrics1)
				expect(result).to.be.equal(true)
			})
			it('When the metrics address is not specified.', async () => {
				const result = await metricsGroupMigaration.isGroup(dummyMetrics)
				expect(result).to.be.equal(false)
			})
			it('Should fail to call addGroup when sent from other than MetricsFactory', async () => {
				const result = await metricsGroupMigaration
					.addGroup(metrics1, {
						from: deployer,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Existing metrics cannot be added.', async () => {
				const result = await metricsGroupMigaration
					.addGroup(metrics1, {
						from: metricsFactory,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'already enabled')
			})
			it('Can not execute addGroup without metricsFactory address.', async () => {
				const result = await metricsGroupMigaration
					.addGroup(dummyMetrics, {
						from: dummyMetricsFactory,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Should fail to call removeGroup when sent from other than MetricsFactory', async () => {
				const result = await metricsGroupMigaration
					.removeGroup(metrics1, {
						from: deployer,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Can not execute removeGroup without metricsFactory address.', async () => {
				const result = await metricsGroupMigaration
					.removeGroup(metrics1, {
						from: dummyMetricsFactory,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Not existing metrics cannot be removed.', async () => {
				const result = await metricsGroupMigaration
					.removeGroup(dummyMetrics, {
						from: metricsFactory,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'address is not group')
			})
			it('existing metrics can be removed.', async () => {
				await metricsGroupMigaration.removeGroup(metrics1, {
					from: metricsFactory,
				})
			})
			it('Deleted metrics addresses are treated as if they do not exist in the group.', async () => {
				const result = await metricsGroupMigaration.isGroup(metrics1)
				expect(result).to.be.equal(false)
			})
		})
		describe('MetricsGroupMigaration; totalIssuedMetrics', () => {
			it('Count increases when metrics are added.', async () => {
				let result = await metricsGroupMigaration.totalIssuedMetrics()
				expect(result.toNumber()).to.be.equal(0)
				await metricsGroupMigaration.addGroup(metrics2, {
					from: metricsFactory,
				})
				result = await metricsGroupMigaration.totalIssuedMetrics()
				expect(result.toNumber()).to.be.equal(1)
				await metricsGroupMigaration.removeGroup(metrics2, {
					from: metricsFactory,
				})
				result = await metricsGroupMigaration.totalIssuedMetrics()
				expect(result.toNumber()).to.be.equal(0)
			})
		})
		describe('MetricsGroupMigaration; getMetricsCountPerProperty', () => {
			it('Count increases when metrics are added.', async () => {
				let result = await metricsGroupMigaration.getMetricsCountPerProperty(
					dummyProperty
				)
				expect(result.toNumber()).to.be.equal(0)
				await metricsGroupMigaration.addGroup(metrics2, {
					from: metricsFactory,
				})
				result = await metricsGroupMigaration.getMetricsCountPerProperty(
					dummyProperty
				)
				expect(result.toNumber()).to.be.equal(1)
				await metricsGroupMigaration.removeGroup(metrics2, {
					from: metricsFactory,
				})
				result = await metricsGroupMigaration.getMetricsCountPerProperty(
					dummyProperty
				)
				expect(result.toNumber()).to.be.equal(0)
			})
		})
		describe('MetricsGroupMigaration; hasAssets', () => {
			it('Returns always true', async () => {
				let result = await metricsGroupMigaration.hasAssets(dummyProperty)
				expect(result).to.be.equal(true)
				await metricsGroupMigaration.addGroup(metrics2, {
					from: metricsFactory,
				})
				result = await metricsGroupMigaration.hasAssets(dummyProperty)
				expect(result).to.be.equal(true)
				await metricsGroupMigaration.removeGroup(metrics2, {
					from: metricsFactory,
				})
				result = await metricsGroupMigaration.hasAssets(dummyProperty)
				expect(result).to.be.equal(true)
			})
		})
		describe('MetricsGroupMigaration; __setMetricsCountPerProperty', () => {
			it('Store passed value to getMetricsCountPerProperty as an authenticated assets count', async () => {
				await metricsGroupMigaration
					.__setMetricsCountPerProperty(metrics1, 123)
					.then(gasLogger)
				const stored = await metricsGroupMigaration.getMetricsCountPerProperty(
					metrics1
				)
				expect(stored.toNumber()).to.be.equal(123)
			})
			it('Should fail to call when sent from non-owner account', async () => {
				const res = await metricsGroupMigaration
					.__setMetricsCountPerProperty(dummyMetrics, 123, {from: user})
					.then(gasLogger)
					.catch((err: Error) => err)
				const result = await metricsGroupMigaration.getMetricsCountPerProperty(
					dummyMetrics
				)
				expect(result.toNumber()).to.be.equal(0)
				expect(res).to.be.instanceOf(Error)
			})
		})
	}
)
