contract('MetricsGroupTest', ([deployer, u1]) => {
	const marketContract = artifacts.require('market/Market')
	const marketGroupContract = artifacts.require('market/MarketGroup')
	const marketFactoryContract = artifacts.require('market/MarketFactory')
	const stateContract = artifacts.require('State')
	const metricsGroupContract = artifacts.require('metrics/MetricsGroup')
	describe('MetricsGroupTest', () => {
		//var expectedMetoricsAddress: any
		var metricsGroup: any
		beforeEach(async () => {
			const marketGroup = await marketGroupContract.new({
				from: deployer
			})
			const marketFactory = await marketFactoryContract.new({
				from: deployer
			})
			const state = await stateContract.new({
				from: deployer
			})
			metricsGroup = await metricsGroupContract.new({
				from: deployer
			})
			await state.setMarketFactory(marketFactory.address, {from: deployer})
			await state.setMarketGroup(marketGroup.address, {from: deployer})
			await state.setMetricsGroup(metricsGroup.address, {from: deployer})
			await marketGroup.changeStateAddress(state.address, {from: deployer})
			await marketFactory.changeStateAddress(state.address, {from: deployer})
			await metricsGroup.changeStateAddress(state.address, {from: deployer})
			const result = await marketFactory.createMarket(u1, {from: deployer})
			const expectedMarketAddress = await result.logs.filter(
				(e: {event: string}) => e.event === 'Create'
			)[0].args._market
			const market = await marketContract.at(expectedMarketAddress)
			// TODO how to get address
			await market.authenticatedCallback(
				'0xd868711BD9a2C6F1548F5f4737f71DA67d821090'
			)
			// expectedMetoricsAddress = '0x0'
		})
		it('isMetrics', async () => {
			// Const result3 = await metricsGroup.isMetrics(expectedMetoricsAddress)
			// expect(result3).to.be.equal(true)
		})
		it('isMetrics false', async () => {
			const result = await metricsGroup.isMetrics(
				'0xfbDBcF1EbE27245E3488541f19CAC902E53239a4'
			)
			expect(result).to.be.equal(false)
		})
	})
})
