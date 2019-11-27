contract('MetricsGroupTest', ([deployer, u1, property, dummyMetrics]) => {
	const marketContract = artifacts.require('market/Market')
	const marketGroupContract = artifacts.require('market/MarketGroup')
	const marketFactoryContract = artifacts.require('market/MarketFactory')
	const addressConfigContract = artifacts.require('config/AddressConfig')
	const metricsGroupContract = artifacts.require('metrics/MetricsGroup')
	const policyContract = artifacts.require('policy/PolicyTest')
	const policyFactoryContract = artifacts.require('policy/PolicyFactory')
	const lockupContract = artifacts.require('Lockup')
	const dummyDEVContract = artifacts.require('DummyDEV')

	describe('MetricsGroup; isMetrics', () => {
		// Let expectedMetoricsAddress: any
		let metricsGroup: any
		beforeEach(async () => {
			const addressConfig = await addressConfigContract.new({
				from: deployer
			})
			const marketGroup = await marketGroupContract.new(addressConfig.address, {
				from: deployer
			})
			const marketFactory = await marketFactoryContract.new(
				addressConfig.address,
				{
					from: deployer
				}
			)
			const policy = await policyContract.new({from: deployer})
			const policyFactory = await policyFactoryContract.new(
				addressConfig.address,
				{
					from: deployer
				}
			)
			await addressConfig.setPolicyFactory(policyFactory.address, {
				from: deployer
			})
			await policyFactory.createPolicy(policy.address)
			const lockup = await lockupContract.new(addressConfig.address)
			await addressConfig.setLockup(lockup.address, {
				from: deployer
			})
			const dummyDEV = await dummyDEVContract.new('Dev', 'DEV', 18, 10000, {
				from: deployer
			})
			await addressConfig.setToken(dummyDEV.address, {from: deployer})
			await dummyDEV.transfer(u1, 10, {from: deployer})

			metricsGroup = await metricsGroupContract.new(addressConfig.address, {
				from: deployer
			})
			await addressConfig.setMarketFactory(marketFactory.address, {
				from: deployer
			})
			await addressConfig.setMarketGroup(marketGroup.address, {from: deployer})
			await addressConfig.setMetricsGroup(metricsGroup.address, {
				from: deployer
			})
			const result = await marketFactory.createMarket(u1, {from: deployer})
			const expectedMarketAddress = await result.logs.filter(
				(e: {event: string}) => e.event === 'Create'
			)[0].args._market
			const market = await marketContract.at(expectedMarketAddress)
			// How to get address
			await market.authenticatedCallback(property, {from: u1})
			// ExpectedMetoricsAddress = '0x0'
		})
		it('When the metrics address is specified', async () => {
			// Const result3 = await metricsGroup.isMetrics(expectedMetoricsAddress)
			// expect(result3).to.be.equal(true)
		})
		it('When the metrics address is not specified', async () => {
			const result = await metricsGroup.isMetrics(dummyMetrics)
			expect(result).to.be.equal(false)
		})
	})
})
