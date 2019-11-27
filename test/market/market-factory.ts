contract('MarketFactoryTest', ([deployer, u1]) => {
	const marketFactoryContract = artifacts.require('market/MarketFactory')
	const marketContract = artifacts.require('market/Market')
	const marketGroupContract = artifacts.require('market/MarketGroup')
	const addressConfigContract = artifacts.require('config/AddressConfig')
	const policyContract = artifacts.require('policy/PolicyTest')
	const policyFactoryContract = artifacts.require('policy/PolicyFactory')
	describe('MarketFactory; createMarket', () => {
		let marketFactory: any
		let marketGroup: any
		let addressConfig: any
		let expectedMarketAddress: any
		let deployedMarket: any
		let policy: any
		let policyFactory: any
		beforeEach(async () => {
			addressConfig = await addressConfigContract.new({from: deployer})
			marketFactory = await marketFactoryContract.new(addressConfig.address, {
				from: deployer
			})
			marketGroup = await marketGroupContract.new(addressConfig.address, {
				from: deployer
			})
			await addressConfig.setMarketFactory(marketFactory.address, {
				from: deployer
			})
			await addressConfig.setMarketGroup(marketGroup.address, {from: deployer})
			policy = await policyContract.new({from: deployer})
			policyFactory = await policyFactoryContract.new(addressConfig.address, {
				from: deployer
			})
			await addressConfig.setPolicyFactory(policyFactory.address, {
				from: deployer
			})
			await policyFactory.createPolicy(policy.address)
			const result = await marketFactory.createMarket(u1, {from: deployer})

			expectedMarketAddress = await result.logs.filter(
				(e: {event: string}) => e.event === 'Create'
			)[0].args._market
		})

		it('Create a new Market Contract and emit Create Event telling created market address', async () => {
			deployedMarket = await marketContract.at(expectedMarketAddress)
			const behaviorAddress = await deployedMarket.behavior({from: deployer})

			expect(behaviorAddress).to.be.equal(u1)
		})

		it('Adds a new Market Contract address to State Contract', async () => {
			await marketGroup.validateMarketAddress(expectedMarketAddress, {
				from: deployer
			})
		})
	})
})
