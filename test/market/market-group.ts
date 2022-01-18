import { DevProtocolInstance } from '../test-lib/instance'
import { validateErrorMessage } from '../test-lib/utils/error'
import {
	takeSnapshot,
	revertToSnapshot,
	Snapshot,
} from '../test-lib/utils/snapshot'

contract(
	'MarketGroupTest',
	([
		deployer,
		marketFactory,
		dummyMarketFactory,
		market1,
		market2,
		dummyMarket,
	]) => {
		const dev = new DevProtocolInstance(deployer)
		let snapshot: Snapshot
		let snapshotId: string

		beforeEach(async () => {
			snapshot = (await takeSnapshot()) as Snapshot
			snapshotId = snapshot.result
		})

		afterEach(async () => {
			await revertToSnapshot(snapshotId)
		})
		describe('MarketGroup addGroup, isGroup, getCount', () => {
			before(async () => {
				await dev.generateAddressConfig()
				await dev.generateMarketGroup()
				await dev.addressConfig.setMarketFactory(marketFactory, {
					from: deployer,
				})
				await dev.marketGroup.addGroup(market1, { from: marketFactory })
			})
			it('When a market address is specified', async () => {
				const result = await dev.marketGroup.isGroup(market1)
				expect(result).to.be.equal(true)
			})
			it('The number increases as you add addresses', async () => {
				let result = await dev.marketGroup.getCount()
				expect(result.toNumber()).to.be.equal(1)
				await dev.marketGroup.addGroup(market2, { from: marketFactory })
				result = await dev.marketGroup.getCount()
				expect(result.toNumber()).to.be.equal(2)
			})
			it('When the market address is not specified', async () => {
				const result = await dev.marketGroup.isGroup(dummyMarket)
				expect(result).to.be.equal(false)
			})
			it('Existing market cannot be added', async () => {
				const result = await dev.marketGroup
					.addGroup(market1, {
						from: marketFactory,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'already enabled')
			})
			it('Can not execute addGroup without marketFactory address', async () => {
				const result = await dev.marketGroup
					.addGroup(dummyMarket, {
						from: dummyMarketFactory,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'illegal access')
			})
		})
		describe('MarketGroup deleteGroup, isGroup, getCount', () => {
			before(async () => {
				await dev.generateAddressConfig()
				await dev.generateMarketGroup()
				await dev.addressConfig.setMarketFactory(marketFactory, {
					from: deployer,
				})
				await dev.marketGroup.addGroup(market1, { from: marketFactory })
			})
			it('The number reduce as you delete addresses', async () => {
				let result = await dev.marketGroup.getCount()
				expect(result.toNumber()).to.be.equal(1)
				await dev.marketGroup.deleteGroup(market1, { from: marketFactory })
				result = await dev.marketGroup.getCount()
				expect(result.toNumber()).to.be.equal(0)
			})
			it('Excluded from the group', async () => {
				let result = await dev.marketGroup.isGroup(market1)
				expect(result).to.be.equal(true)
				await dev.marketGroup.deleteGroup(market1, { from: marketFactory })
				result = await dev.marketGroup.isGroup(market1)
				expect(result).to.be.equal(false)
			})
			it('Existing market cannot be added', async () => {
				const result = await dev.marketGroup
					.deleteGroup(market2, {
						from: marketFactory,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'not exist')
			})
			it('Can not execute addGroup without marketFactory address', async () => {
				const result = await dev.marketGroup
					.deleteGroup(dummyMarket, {
						from: dummyMarketFactory,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'illegal access')
			})
		})
	}
)
