contract('metricsTest', ([metricsFactory, market, property]) => {
	const metricsContract = artifacts.require('Metrics')
	describe('Metrics; constructor', () => {
		it('The set address can be referenced.', async () => {
			const metrics = await metricsContract.new(market, property, {
				from: metricsFactory
			})
			expect(await metrics.market()).to.be.equal(market)
			expect(await metrics.property()).to.be.equal(property)
		})
	})
})
