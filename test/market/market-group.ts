contract(
	'MarketGroupTest',
	([deployer, marketFactory, market, dummyMarket]) => {
		const marketGroupContract = artifacts.require('MarketGroup')
		const addressConfigContract = artifacts.require('AddressConfig')
		describe('MarketGroup validateMarketAddress', () => {
			let marketGroup: any
			beforeEach(async () => {
				const addressConfig = await addressConfigContract.new({
					from: deployer
				})
				marketGroup = await marketGroupContract.new(addressConfig.address, {
					from: deployer
				})
				await marketGroup.createStorage()
				await addressConfig.setMarketGroup(marketGroup.address, {
					from: deployer
				})
				await addressConfig.setMarketFactory(marketFactory, {from: deployer})
				await marketGroup.addGroup(market, {from: marketFactory})
			})
			it('When a market address is specified', async () => {
				const result = await marketGroup.isGroup(market)
				expect(result).to.be.equal(true)
			})
			it('When the market address is not specified', async () => {
				const result = await marketGroup.isGroup(dummyMarket)
				expect(result).to.be.equal(false)
			})
		})
	}
)
