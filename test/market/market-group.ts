import {DevProtocolInstance} from '../test-lib/instance'

contract(
	'MarketGroupTest',
	([deployer, marketFactory, market, dummyMarket]) => {
		const dev = new DevProtocolInstance(deployer)
		describe('MarketGroup addGroup, isGroup', () => {
			before(async () => {
				await dev.generateAddressConfig()
				await dev.generateMarketGroup()
				await dev.addressConfig.setMarketFactory(marketFactory, {
					from: deployer
				})
				await dev.marketGroup.addGroup(market, {from: marketFactory})
			})
			it('When a market address is specified', async () => {
				const result = await dev.marketGroup.isGroup(market)
				expect(result).to.be.equal(true)
			})
			it('When the market address is not specified', async () => {
				const result = await dev.marketGroup.isGroup(dummyMarket)
				expect(result).to.be.equal(false)
			})
		})
	}
)
