import {
	MarketFactoryInstance,
	StateTestInstance,
	MarketInstance
} from '../types/truffle-contracts'

contract('MarketFactory', ([deployer, u1]) => {
	const marketFactoryContract = artifacts.require('MarketFactory')
	const marketContract = artifacts.require('Market')
	const stateContract = artifacts.require('StateTest')

	describe('createMarket', () => {
		var marketFactory: MarketFactoryInstance
		var state: StateTestInstance
		var expectedMarketAddress: any
		var deployedMarket: MarketInstance

		beforeEach(async () => {
			state = await stateContract.new({from: deployer})
			marketFactory = await marketFactoryContract.new({from: deployer})
			await state.setMarketFactory(marketFactory.address, {from: deployer})
			await marketFactory.changeStateAddress(state.address, {from: deployer})

			const result = await marketFactory.createMarket(u1, {from: deployer})

			expectedMarketAddress = await result.logs.filter(
				e => e.event === 'Create'
			)[0].args._market
		})

		it('Create a new Market Contract and emit Create Event telling created market address', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			deployedMarket = await marketContract.at(expectedMarketAddress)
			const behaviorAddress = await deployedMarket.behavior({from: deployer})

			expect(behaviorAddress).to.be.equal(u1)
		})

		it('Adds a new Market Contract address to State Contract', async () => {
			const isContained = await state.containsMarket(expectedMarketAddress, {
				from: deployer
			})

			expect(isContained).to.be.equal(true)
		})
	})
})
