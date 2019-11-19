contract('MarketFactory', ([deployer, u1]) => {
	const marketFactoryContract = artifacts.require('market/MarketFactory')
	const marketContract = artifacts.require('market/Market')
	const marketGroupContract = artifacts.require('market/MarketGroup')
	const stateContract = artifacts.require('State')

	describe('createMarket', () => {
		var marketFactory: any
		var marketGroup: any
		var state: any
		var expectedMarketAddress: any
		var deployedMarket: any

		beforeEach(async () => {
			state = await stateContract.new({from: deployer})
			marketFactory = await marketFactoryContract.new({from: deployer})
			marketGroup = await marketGroupContract.new({from: deployer})
			await state.setMarketFactory(marketFactory.address, {from: deployer})
			await state.setMarketGroup(marketGroup.address, {from: deployer})
			await marketFactory.changeStateAddress(state.address, {from: deployer})
			await marketGroup.changeStateAddress(state.address, {from: deployer})
			const result = await marketFactory.createMarket(u1, {from: deployer})

			expectedMarketAddress = await result.logs.filter(
				(e: {event: string}) => e.event === 'Create'
			)[0].args._market
		})

		it('Create a new Market Contract and emit Create Event telling created market address', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
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
