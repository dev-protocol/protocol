import {DevProtocolInstance} from '../test-lib/instance'
import {
	validateErrorMessage,
	validateAddressErrorMessage
} from '../test-lib/utils'

contract(
	'MarketGroupTest',
	([
		deployer,
		marketFactory,
		dummyMarketFactory,
		market1,
		market2,
		dummyMarket
	]) => {
		const dev = new DevProtocolInstance(deployer)
		describe('MarketGroup addGroup, isGroup', () => {
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await dev.generateMarketGroup()
				await dev.addressConfig.setMarketFactory(marketFactory, {
					from: deployer
				})
				await dev.marketGroup.addGroup(market1, {from: marketFactory})
			})
			it('When a market address is specified', async () => {
				const result = await dev.marketGroup.isGroup(market1)
				expect(result).to.be.equal(true)
			})
			it('The number increases as you add addresses', async () => {
				let result = await dev.marketGroup.getNumber()
				expect(result.toNumber()).to.be.equal(1)
				await dev.marketGroup.addGroup(market2, {from: marketFactory})
				result = await dev.marketGroup.getNumber()
				expect(result.toNumber()).to.be.equal(2)
			})
			it('When the market address is not specified', async () => {
				const result = await dev.marketGroup.isGroup(dummyMarket)
				expect(result).to.be.equal(false)
			})
			it('Existing market cannot be added', async () => {
				const result = await dev.marketGroup
					.addGroup(market1, {
						from: marketFactory
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'already enabled')
			})
			it('Can not execute addGroup without marketFactory address', async () => {
				const result = await dev.marketGroup
					.addGroup(dummyMarket, {
						from: dummyMarketFactory
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
	}
)
