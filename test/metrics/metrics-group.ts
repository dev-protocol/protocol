contract('MetricsGroupTest', ([deployer, u1, property, dummyMetrics]) => {
	const marketContract = artifacts.require('Market')
	const marketGroupContract = artifacts.require('MarketGroup')
	const marketFactoryContract = artifacts.require('MarketFactory')
	const addressConfigContract = artifacts.require('AddressConfig')
	const metricsGroupContract = artifacts.require('MetricsGroup')
	const policyContract = artifacts.require('PolicyTest1')
	const policyFactoryContract = artifacts.require('PolicyFactory')
	const policyGroupContract = artifacts.require('PolicyGroup')
	const lockupContract = artifacts.require('Lockup')
	const lockupPropertyValueContract = artifacts.require('LockupPropertyValue')
	const dummyDEVContract = artifacts.require('DummyDEV')
	const voteTimesContract = artifacts.require('VoteTimes')

	describe('MetricsGroup; isMetrics', () => {
		// Let e XpectedMetorics Address: any
		let metricsGroup: any
		beforeEach(async () => {
			const addressConfig = await addressConfigContract.new({
				from: deployer
			})
			const marketGroup = await marketGroupContract.new(addressConfig.address, {
				from: deployer
			})
			await marketGroup.createStorage()
			const marketFactory = await marketFactoryContract.new(
				addressConfig.address,
				{
					from: deployer
				}
			)
			const voteTimes = await voteTimesContract.new(addressConfig.address, {
				from: deployer
			})
			await voteTimes.createStorage()
			const policy = await policyContract.new({from: deployer})
			const policyGroup = await policyGroupContract.new({from: deployer})
			policyGroup.createStorage()
			await addressConfig.setPolicyGroup(policyGroup.address, {
				from: deployer
			})
			const policyFactory = await policyFactoryContract.new(
				addressConfig.address,
				{
					from: deployer
				}
			)
			await addressConfig.setPolicyFactory(policyFactory.address, {
				from: deployer
			})
			await addressConfig.setVoteTimes(voteTimes.address, {
				from: deployer
			})
			await policyFactory.createPolicy(policy.address)
			const lockup = await lockupContract.new(addressConfig.address)
			await addressConfig.setLockup(lockup.address, {
				from: deployer
			})

			const lockupPropertyValue = await lockupPropertyValueContract.new(
				addressConfig.address
			)
			await lockupPropertyValue.createStorage()
			await addressConfig.setLockupPropertyValue(lockupPropertyValue.address, {
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
			await metricsGroup.createStorage()
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
			//  eslint-disable-next-line @typescript-eslint/await-thenable
			const market = await marketContract.at(expectedMarketAddress)
			//  How t O get address
			await market.authenticatedCallback(property, {from: u1})
			//  Expec TedMetoricsAddr Ess = '0x0'
		})
		it('When the metrics address is Specified', async () => {
			//  Const Resul t3  = awai T metricsGroup.isMetric s(expectedMetoricsAddress)
			//  expec t(result3).to.b e.equal(true)
		})
		it('When the metrics address is not specified', async () => {
			const result = await metricsGroup.isMetrics(dummyMetrics)
			expect(result).to.be.equal(false)
		})
	})
})
