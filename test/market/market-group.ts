contract('MarketGroupTest', ([deployer, u1]) => {
	const marketGroupContract = artifacts.require('market/MarketGroup')
	const marketFactoryContract = artifacts.require('market/MarketFactory')
	const stateContract = artifacts.require('State')
	describe('MarketGroupTest', () => {
		var marketGroup: any
		var expectedMarketAddress: any
		beforeEach(async () => {
			marketGroup = await marketGroupContract.new({
				from: deployer
			})
			const marketFactory = await marketFactoryContract.new({
				from: deployer
			})
			const state = await stateContract.new({
				from: deployer
			})
			await state.setMarketFactory(marketFactory.address, {from: deployer})
			await state.setMarketGroup(marketGroup.address, {from: deployer})
			await marketGroup.changeStateAddress(state.address, {from: deployer})
			await marketFactory.changeStateAddress(state.address, {from: deployer})
			const result = await marketFactory.createMarket(u1, {from: deployer})
			expectedMarketAddress = await result.logs.filter(
				(e: {event: string}) => e.event === 'Create'
			)[0].args._market
		})
		it('validateMarketAddress', async () => {
			await marketGroup.validateMarketAddress(expectedMarketAddress)
		})
		it('validateMarketAddress error', async () => {
			let err = null
			try {
				await marketGroup.validateMarketAddress(
					'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d'
				)
			} catch (error) {
				err = error
			}

			expect(err.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert only market contract.'
			)
		})
	})
})
