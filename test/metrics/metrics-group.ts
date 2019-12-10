contract(
	'MetricsGroupTest',
	([deployer, metricsFactory, metrics, dummyMetrics]) => {
		const addressConfigContract = artifacts.require('AddressConfig')
		const metricsGroupContract = artifacts.require('MetricsGroup')
		describe('MetricsGroup; isMetrics', () => {
			// Let e XpectedMetorics Address: any
			let metricsGroup: any
			beforeEach(async () => {
				const addressConfig = await addressConfigContract.new({
					from: deployer
				})
				metricsGroup = await metricsGroupContract.new(addressConfig.address, {
					from: deployer
				})
				await metricsGroup.createStorage()
				await addressConfig.setMetricsGroup(metricsGroup.address, {
					from: deployer
				})
				await addressConfig.setMetricsFactory(metricsFactory, {
					from: deployer
				})
				metricsGroup.addGroup(metrics, {
					from: metricsFactory
				})
			})
			it('When the metrics address is Specified', async () => {
				const result = await metricsGroup.isGroup(metrics)
				expect(result).to.be.equal(true)
			})
			it('When the metrics address is not specified', async () => {
				const result = await metricsGroup.isGroup(dummyMetrics)
				expect(result).to.be.equal(false)
			})
		})
	}
)
